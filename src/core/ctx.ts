import crypto from 'node:crypto'

import { get, isPlainObject, omitBy } from 'lodash'
import pathe from 'pathe'
import SVGSpriter from 'svg-sprite'
import fse from 'fs-extra'
import { consola } from 'consola'
import { minimatch } from 'minimatch'

import { logger } from './log'
import { IS_DEV, OUTPUT_DIR, SpriteMode } from './constants'

import type { BufferFile } from 'vinyl'
import type { Options } from '../types'

export interface TransformData {
  type: 'static' | 'dynamic'
  svgStr: string
  /** 注意，该哈希值是移除 [ \n\t] 后的字符串计算得出 */
  hash: string
  /** SVG 路径根据文件内容 hash 化 */
  svgHashPath: string
  runtimeId: string
}

/** 文件绝对路径及其详情状态 */
export type TransformMap = Map<string, TransformData>

export interface SvgSpriteCompiledResult {
  static: { result: any; data: any }
  dynamic: { result: any; data: any }
}

export function createContext(options: Options) {
  const {
    content = ['**/*.svg'],
    publicDir = 'public',
    outputDir = OUTPUT_DIR,
    spriterConfig,
    sprites = {},
    debug = false,
  } = options || {}

  if (debug) {
    logger.level = 4
  }

  if (!Object.keys(sprites).length) {
    throw new Error(
      `Pick a sprite mode required, supported [${Object.values(SpriteMode).join(
        ', ',
      )}]`,
    )
  }

  const absolutePublicPath = pathe.join(process.cwd(), publicDir)
  const absoluteOutputPath = pathe.join(absolutePublicPath, outputDir)
  const absoluteOutputStaticPath = pathe.join(absoluteOutputPath, 'static')
  const absoluteOutputDynamicPath = pathe.join(absoluteOutputPath, 'dynamic')
  const userModes = Object.keys(sprites)
  const useSymbolMode = 'symbol' in sprites

  const spriterMode = userModes.reduce((prev, current) => {
    const userCurrentConfig = get(sprites, [current])
    const mergedConfig = isPlainObject(userCurrentConfig)
      ? userCurrentConfig
      : {}

    return {
      ...prev,
      [current]: {
        example: debug,
        /** 开发环境雪碧图文件名不做 hash 处理，保证 HMR 不受影响 */
        bust: !IS_DEV,
        ...mergedConfig,
      },
    }
  }, {} as SVGSpriter.Mode)

  const isDynamicSvg = (svgStr: string) => {
    // ref: https://stackoverflow.com/a/74173265/8335317
    return [
      'linearGradient',
      'radialGradient',
      'filter',
      'clipPath',
      ...(options.sprites.symbol?.runtime.dynamicSvgNodes || []),
    ].some((item) => {
      // 简单判断一下是否存在相关节点
      return svgStr.includes(`<${item}`)
    })
  }

  const contentPatterns = [
    ...content,
    `!${publicDir}/${outputDir}`,
    `!node_modules`,
  ]

  const store = {
    /** 所有 SVG 缓存对象 */
    transformMap: new Map() as TransformMap,
    /** 雪碧图编译结果缓存 */
    svgSpriteCompiledResult: null as SvgSpriteCompiledResult | null,
  }
  const compile = async () => {
    logger.debug('Spriter compile start...')

    const staticSpriter = new SVGSpriter({
      ...spriterConfig,
      dest: absoluteOutputStaticPath,
      mode: spriterMode,
    })

    const dynamicSpriter = new SVGSpriter({
      ...spriterConfig,
      dest: absoluteOutputDynamicPath,
      mode: spriterMode,
    })

    let staticCount = 0
    let dynamicCount = 0

    store.transformMap.forEach((value) => {
      if (value.type === 'static') {
        staticCount += 1
        staticSpriter.add(value.svgHashPath, null, value.svgStr)
      } else {
        dynamicCount += 1
        dynamicSpriter.add(value.svgHashPath, null, value.svgStr)
      }
    })

    logger.log(`SVG sprite static transform size: ${staticCount}`)
    logger.log(`SVG sprite dynamic transform size: ${dynamicCount}`)

    const [staticResult, dynamicResult] = await Promise.all([
      staticSpriter.compileAsync(),
      dynamicSpriter.compileAsync(),
    ])
    store.svgSpriteCompiledResult = {
      static: staticResult,
      dynamic: dynamicResult,
    }

    if (debug) {
      logger.debug('Spriter compile end')
    }

    logger.debug('Write sprite files start...')
    fse.emptyDirSync(absoluteOutputPath)

    async function writeStaticFiles() {
      for (const [_, modeResult] of Object.entries<{ string: BufferFile }>(
        store.svgSpriteCompiledResult!.static.result,
      )) {
        for (const resource of Object.values(modeResult)) {
          await fse.ensureDir(pathe.dirname(resource.path))
          await fse.writeFile(resource.path, resource.contents)
        }
      }
    }
    async function writeDynamicFiles() {
      for (const [_, modeResult] of Object.entries<{ string: BufferFile }>(
        store.svgSpriteCompiledResult!.static.result,
      )) {
        for (const resource of Object.values(modeResult)) {
          await fse.ensureDir(pathe.dirname(resource.path))
          await fse.writeFile(resource.path, resource.contents)
        }
      }
      for (const [_, modeResult] of Object.entries<{ string: BufferFile }>(
        store.svgSpriteCompiledResult!.dynamic.result,
      )) {
        for (const resource of Object.values(modeResult)) {
          await fse.ensureDir(pathe.dirname(resource.path))
          await fse.writeFile(resource.path, resource.contents)
        }
      }
    }
    function stat() {
      return Array.from(store.transformMap).reduce(
        (prev, [key, value]) => {
          const grouped = Object.keys(prev).find((item) => {
            return value.hash === item
          })
          if (grouped) {
            prev[grouped] = [...prev[grouped], key]
            return prev
          }
          return {
            ...prev,
            [value.hash]: [key],
          }
        },
        // 文件 hash 与文件 hash 相同的文件路径数组
        {} as Record<string, string[]>,
      )
    }

    function printStat() {
      const result = omitBy(stat(), (value) => value.length <= 1)
      if (Object.keys(result).length) {
        logger.log('There are same files have same file hash:')
        const format = Object.keys(result).reduce((prev, current) => {
          prev += `🤖 ${current}\n`
          prev += `  - ${result[current].join('\n  - ')}\n`
          return prev
        }, '\n')
        consola.log(format)
      } else {
        logger.log('No duplicate svg files')
      }
    }

    await Promise.all([writeStaticFiles(), writeDynamicFiles()])
    logger.debug('Write sprite files end')
    logger.debug('Svg stat start')
    printStat()
    logger.debug('Svg stat end')
  }

  const upsertSvg = (path: string, _map: TransformMap, watch = false) => {
    const svgStr = fse.readFileSync(path, { encoding: 'utf-8' })

    const hash = crypto
      .createHash('md5')
      .update(svgStr.replace(/[ \n\t]/g, ''), 'utf8')
      .digest('hex')
      .slice(0, 8)

    const svgId = `${pathe.parse(path).name}-${hash}`

    const type = isDynamicSvg(svgStr) ? 'dynamic' : 'static'

    const svgHashPath = pathe.join(pathe.dirname(path), `${svgId}.svg`)

    if (_map.get(path)) {
      logger.log(`Update ${type} svg`, path)
    } else {
      if (watch) {
        logger.log(`Add ${type} svg`, path)
      } else {
        logger.debug(`Add ${type} svg`, path)
      }
    }

    _map.set(path, {
      type,
      svgStr,
      hash,
      svgHashPath,
      runtimeId: svgId,
    })
  }

  const scanDirs = async () => {
    const { globbySync } = await import('globby')
    const svgFiles = globbySync(contentPatterns)

    logger.debug('Match files:', svgFiles.length)

    const _transformMap = new Map() as TransformMap

    svgFiles
      .filter((item) => item.endsWith('.svg'))
      .map((item) => {
        return pathe.join(process.cwd(), item)
      })
      .forEach((item) => {
        upsertSvg(item, _transformMap)
      })

    store.transformMap = _transformMap

    await compile()
  }

  function waitSpriteCompiled() {
    return new Promise<void>((resolve, reject) => {
      if (store.svgSpriteCompiledResult) {
        resolve()
      }

      let count = 0

      function check() {
        setTimeout(() => {
          count += 1
          if (store.svgSpriteCompiledResult) {
            resolve()
            return
          }

          if (count >= 100) {
            reject(new Error(`Compile by svg-sprite timeout of ${count}s`))
          }

          check()
        }, 1e3)
      }

      check()
    })
  }

  const timer: Record<string, NodeJS.Timeout> = {}

  const handleSvgUpsert = (path: string) => {
    const relativePath = pathe.relative(process.cwd(), path)
    if (
      contentPatterns
        .map((item) => minimatch(relativePath, item))
        .every((item) => item === true)
    ) {
      clearTimeout(timer[path])
      timer[path] = setTimeout(() => {
        upsertSvg(path, store.transformMap, true)
        compile()
        delete timer[path]
      })
    }
  }

  const handleSvgUnlink = (path: string) => {
    const relativePath = pathe.relative(process.cwd(), path)
    const type = store.transformMap.get(path)?.type
    if (
      contentPatterns
        .map((item) => minimatch(relativePath, item))
        .every((item) => item === true) &&
      type
    ) {
      store.transformMap.delete(path)
      logger.log(`Delete ${type} svg`, path)
      compile()
    }
  }

  return {
    sprites,
    /** 是否启用 symbol 雪碧图 */
    useSymbolMode,
    /** SVG 路径 Glob 表达式集 */
    contentPatterns,
    store,
    path: {
      publicDir,
      outputDir,
      absolutePublicPath,
      absoluteOutputPath,
    },
    api: {
      scanDirs,
      compile,
      isDynamicSvg,
      waitSpriteCompiled,
      handleSvgUpsert,
      handleSvgUnlink,
    },
  }
}

let ctx: ReturnType<typeof createContext>

export function getContext(options: Options) {
  if (ctx) {
    logger.debug('Reuse ctx')
    return ctx
  }
  logger.debug('Create new ctx')
  return (ctx = createContext(options))
}
