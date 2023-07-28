import crypto from 'node:crypto'

import { get, isPlainObject, omitBy } from 'lodash'
import pathe from 'pathe'
import SVGSpriter from 'svg-sprite'
import fse from 'fs-extra'

import { logger } from './log'
import { OUTPUT_DIR, SpriteMode } from './constants'

import type { BufferFile } from 'vinyl'
import type { Options } from '../types'

export interface TransformData {
  type: 'static' | 'dynamic'
  svgStr: string
  hash: string
  svgHashPath: string
  runtimeId: string
}

/** 文件绝对路径及其详情状态 */
export type TransformMap = Map<string, TransformData>

export interface SvgSpriteCompiledResult {
  static: { result: any; data: any }
  dynamic: { result: any; data: any }
}

const store = {
  compileComplete: false,
  transformMap: new Map() as TransformMap,
  svgSpriteCompiledResult: null as SvgSpriteCompiledResult | null,
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
        bust: true,
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

  const scanDirs = async () => {
    if (store.compileComplete) {
      logger.debug('Compile completed, skip recompile')
      return
    }

    const { globbySync } = await import('globby')

    const svgFiles = globbySync([
      ...content,
      `!${publicDir}/${outputDir}`,
      `!node_modules`,
    ])

    let staticCount = 0
    let dynamicCount = 0

    svgFiles
      .filter((item) => item.endsWith('.svg'))
      .map((item) => {
        return pathe.join(process.cwd(), item)
      })
      .forEach((item) => {
        if (store.transformMap.get(item)) {
          return
        }

        const svgStr = fse.readFileSync(item, { encoding: 'utf-8' })

        const hash = crypto
          .createHash('md5')
          .update(svgStr, 'utf8')
          .digest('hex')
          .slice(0, 8)

        const svgId = `${pathe.parse(item).name}-${hash}`

        const type = isDynamicSvg(svgStr) ? 'dynamic' : 'static'

        const svgHashPath = pathe.join(pathe.dirname(item), `${svgId}.svg`)

        store.transformMap.set(item, {
          type,
          svgStr,
          hash,
          svgHashPath,
          runtimeId: svgId,
        })

        logger.debug(`Find ${type} svg`, item)
        if (isDynamicSvg(svgStr)) {
          dynamicCount += 1
        } else {
          staticCount += 1
        }
      })

    logger.log(`SVG sprite static transform size: ${staticCount}`)
    logger.log(`SVG sprite dynamic transform size: ${dynamicCount}`)
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

    store.transformMap.forEach((value) => {
      if (value.type === 'static') {
        staticSpriter.add(value.svgHashPath, null, value.svgStr)
      } else {
        dynamicSpriter.add(value.svgHashPath, null, value.svgStr)
      }
    })

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
    await fse.emptyDir(absoluteOutputPath)

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
      if (result) {
        const format = Object.keys(result).reduce((prev, current) => {
          prev += `🤖 ${current}\n`
          prev += `  - ${result[current].join('\n  - ')}\n`
          return prev
        }, '\n')
        logger.log(format)
      } else {
        logger.log('No svg files similarity > 80%')
      }
    }

    await Promise.all([writeStaticFiles(), writeDynamicFiles()])
    logger.debug('Write sprite files end')
    logger.debug('Svg stat start')
    printStat()
    logger.debug('Svg stat end')

    store.compileComplete = true
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

  return {
    store,
    mode: spriterMode,
    content,
    absolutePublicPath,
    absoluteOutputPath,
    outputDir,
    sprites,
    useSymbolMode,
    debug,
    scanDirs,
    isDynamicSvg,
    waitSpriteCompiled,
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
