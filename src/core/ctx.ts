import crypto from 'node:crypto'

import { get, isPlainObject, omitBy, padStart } from 'lodash'
import pathe from 'pathe'
import SVGSpriter from 'svg-sprite'
import fse from 'fs-extra'
import { minimatch } from 'minimatch'

import { logger } from './log'
import { IS_DEV, OUTPUT_DIR, SpriteMode } from './constants'

import type { BufferFile } from 'vinyl'
import type { Options } from '../types'

export interface TransformData {
  type: 'static' | 'dynamic'
  svgStr: string
  /** [Attention] the hash value calculated by remove [ \n\t] */
  hash: string
  /** SVG full path, svg name with hash postfix */
  svgHashPath: string
  /** [name]-[hash] */
  runtimeId: string
  /** Flag indicate whether the svg has been used */
  used: boolean
}

/** SVG full path and its detail data */
export type TransformMap = Map<string, TransformData>

export interface SvgSpriteCompiledResult {
  static: { result: { [mode: string]: { sprite: BufferFile } }; data: any }
  dynamic: { result: { [mode: string]: { sprite: BufferFile } }; data: any }
}

export function createContext(options: Options) {
  const {
    content = ['**/*.svg'],
    publicDir = 'public',
    outputDir = OUTPUT_DIR,
    spriterConfig,
    sprites = {},
    debug = false,
    silent = false,
  } = options || {}

  if (debug) {
    // ref: https://github.com/unjs/consola#log-level
    logger.level = 4
  }
  if (silent) {
    logger.level = 1
  }

  const mergedSpriterConfig = {
    ...spriterConfig,
    shape: {
      transform: [
        {
          // svg-sprite internal logic: https://github.com/svg-sprite/svg-sprite/blob/main/lib/svg-sprite/transform/svgo.js#L48
          // ref: https://github.com/svg/svgo#configuration
          svgo: {
            plugins: [
              'preset-default',
              { name: 'removeDimensions', active: true },
              { name: 'removeViewBox', active: false },
            ],
          },
        },
      ],
      ...spriterConfig?.shape,
    },
    svg: {
      xmlDeclaration: false,
      doctypeDeclaration: false,
      dimensionAttributes: false,
      ...spriterConfig?.svg,
    },
    log: debug ? 'debug' : undefined,
  } as any as SVGSpriter.Config

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
  const useSymbolResourceQuery =
    'symbol' in sprites && !!sprites.symbol?.runtime.resourceQuery

  const isDynamicSvg = (svgStr: string) => {
    // ref: https://stackoverflow.com/a/74173265/8335317
    return [
      'linearGradient',
      'radialGradient',
      'filter',
      'clipPath',
      ...(options.sprites.symbol?.runtime.dynamicSvgNodes || []),
    ].some((item) => {
      return svgStr.includes(`<${item}`)
    })
  }

  const contentPatterns = [
    ...content,
    `!${publicDir}/${outputDir}`,
    `!node_modules`,
  ]

  const store = {
    /** All SVG cache map */
    transformMap: new Map() as TransformMap,
    /** hash, uniq path */
    duplicatedHashes: {} as Record<string, string>,
    svgSpriteCompiledResult: null as SvgSpriteCompiledResult | null,
  }
  const compile = async (
    options: { optimization?: boolean } = { optimization: false },
  ) => {
    const { optimization = false } = options

    if (optimization) {
      logger.debug('Spriter compile start...')
    } else {
      logger.debug('Spriter compile with optimization start...')
    }

    const spriterMode = userModes.reduce((prev, current) => {
      const userCurrentConfig = get(sprites, [current])
      const mergedConfig = isPlainObject(userCurrentConfig)
        ? userCurrentConfig
        : {}

      return {
        ...prev,
        [current]: {
          example: !optimization && debug,
          /** For better HMR, SVG sprite file name without hash in DEV env */
          bust: !IS_DEV,
          ...mergedConfig,
        },
      }
    }, {} as SVGSpriter.Mode)

    const staticSpriter = new SVGSpriter({
      ...mergedSpriterConfig,
      dest: absoluteOutputStaticPath,
      mode: spriterMode,
    })

    const dynamicSpriter = new SVGSpriter({
      ...mergedSpriterConfig,
      dest: absoluteOutputDynamicPath,
      mode: spriterMode,
    })

    let staticCount = 0
    let dynamicCount = 0

    const addedDuplicatedHashes: string[] = []

    store.transformMap.forEach((item, key) => {
      if (optimization && !item.used) {
        logger.debug(`Never been used svg: ${key}`)
        return
      }
      if (optimization && store.duplicatedHashes[item.hash]) {
        if (addedDuplicatedHashes.includes(item.hash)) {
          logger.debug(`Duplicated svg [${item.hash}]: ${key}`)
          return
        } else {
          addedDuplicatedHashes.push(item.hash)
        }
      }

      if (item.type === 'static') {
        staticCount += 1
        staticSpriter.add(item.svgHashPath, null, item.svgStr)
      } else {
        dynamicCount += 1
        dynamicSpriter.add(item.svgHashPath, null, item.svgStr)
      }
    })

    if (optimization) {
      let originStaticSize = 0
      let originDynamicSize = 0
      store.transformMap.forEach((item) => {
        if (item.type === 'static') {
          originStaticSize += 1
        } else {
          originDynamicSize += 1
        }
      })

      if (originStaticSize !== staticCount) {
        logger.warn(
          `Static svg sprite size optimized: ${originStaticSize} => ${staticCount}`,
        )
      }
      if (originDynamicSize !== dynamicCount) {
        logger.warn(
          `Dynamic svg sprite size optimized: ${originStaticSize} => ${staticCount}`,
        )
      }
    } else {
      logger.log(`SVG sprite static transform size: ${staticCount}`)
      logger.log(`SVG sprite dynamic transform size: ${dynamicCount}`)
    }

    const [staticResult, dynamicResult] = await Promise.all([
      staticSpriter.compileAsync(),
      dynamicSpriter.compileAsync(),
    ])
    store.svgSpriteCompiledResult = {
      static: staticResult,
      dynamic: dynamicResult,
    }

    if (debug) {
      if (optimization) {
        logger.debug('Spriter compile with optimization end')
      } else {
        logger.debug('Spriter compile end')
      }
    }

    if (optimization) {
      logger.debug('Write optimized sprite files start...')
    } else {
      logger.debug('Write sprite files start...')
    }

    const { globbySync } = await import('globby')
    const generatedSvgSprites = globbySync(
      ['static/**/sprite.*-*.svg', 'dynamic/**/sprite.*-*.svg'],
      {
        cwd: absoluteOutputPath,
      },
    )

    fse.emptyDirSync(absoluteOutputPath)

    async function writeStaticFiles() {
      for (const [mode, modeResult] of Object.entries(
        store.svgSpriteCompiledResult!.static.result,
      )) {
        for (const resource of Object.values(modeResult)) {
          await fse.ensureDir(pathe.dirname(resource.path))

          // Only write svg sprite if compile with optimization
          if (optimization) {
            if (resource.path.endsWith('.svg')) {
              // Find generated svg sprite path in build start stage
              const targetGeneratedPath = generatedSvgSprites.find((item) => {
                return pathe
                  .normalize(item)
                  .startsWith(pathe.join('static', mode))
              })
              if (!targetGeneratedPath) {
                throw new Error('targetGeneratedPath not found')
              }
              const optimizedFilePath = pathe.join(
                absoluteOutputPath,
                targetGeneratedPath,
              )
              await fse.writeFile(optimizedFilePath, resource.contents)
              logger.log(
                `Output optimized static svg sprite: ${optimizedFilePath}`,
              )
            }
            return
          }

          await fse.writeFile(resource.path, resource.contents)
          if (resource.path.endsWith('.svg')) {
            logger.log(`Output static svg sprite: ${resource.path}`)
          }
        }
      }
    }
    async function writeDynamicFiles() {
      for (const [mode, modeResult] of Object.entries(
        store.svgSpriteCompiledResult!.dynamic.result,
      )) {
        for (const resource of Object.values(modeResult)) {
          await fse.ensureDir(pathe.dirname(resource.path))

          // Only write svg sprite if compile with optimization
          if (optimization) {
            if (resource.path.endsWith('.svg')) {
              // Find generated svg sprite path in build start stage
              const targetGeneratedPath = generatedSvgSprites.find((item) => {
                return pathe
                  .normalize(item)
                  .startsWith(pathe.join('dynamic', mode))
              })
              if (!targetGeneratedPath) {
                throw new Error('targetGeneratedPath not found')
              }
              const optimizedFilePath = pathe.join(
                absoluteOutputPath,
                targetGeneratedPath,
              )
              await fse.writeFile(optimizedFilePath, resource.contents)
              logger.log(
                `Output optimized dynamic svg sprite: ${optimizedFilePath}`,
              )
            }
            return
          }

          await fse.writeFile(resource.path, resource.contents)
          if (resource.path.endsWith('.svg')) {
            logger.log(`Output dynamic svg sprite: ${resource.path}`)
          }
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
        // a hash with same hash files
        {} as Record<string, string[]>,
      )
    }

    function printStat() {
      const result = omitBy(stat(), (value) => value.length <= 1)
      if (Object.keys(result).length) {
        const format = Object.keys(result).reduce(
          (prev, current, index, array) => {
            prev += `🤖 ${padStart(
              `${index + 1}`,
              String(array.length).length,
              '0',
            )}.${current}\n`
            prev += `  - ${result[current].join('\n  - ')}\n`
            return prev
          },
          '\n\n',
        )
        logger.log(
          `There are some SVGs have same file hash (after [ \\n\\t] removed):${format}`,
        )
      } else {
        logger.debug('No duplicate svg files')
      }
    }

    await Promise.all([writeStaticFiles(), writeDynamicFiles()])

    if (optimization) {
      logger.debug('Write optimized sprite files end')
      return
    } else {
      logger.debug('Write sprite files end')
    }

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
      used: false,
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

    const hashed: Record<string, string> = {}
    _transformMap.forEach((item, key) => {
      if (hashed[item.hash]) {
        if (!store.duplicatedHashes[item.hash]) {
          store.duplicatedHashes[item.hash] = hashed[item.hash]
        }
        const originData = _transformMap.get(hashed[item.hash])!
        _transformMap.set(key, originData)
      } else {
        hashed[item.hash] = key
      }
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
    useSymbolMode,
    useSymbolResourceQuery,
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
