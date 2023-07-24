import crypto from 'node:crypto'

import { get, isPlainObject } from 'lodash'
import pathe from 'pathe'
import SVGSpriter from 'svg-sprite'
import fse from 'fs-extra'

import { logger } from '../log'

import { OUTPUT_DIR, SVG_SPRITE_PREFIX, SpriteMode } from './constants'
import { generateDeclarations } from './helpers/declarations'

import type { BufferFile } from 'vinyl'
import type { Options } from '../types'

const store = {
  compileComplete: false,
  transformMap: {} as Record<string, string>,
  svgSpriteCompiledResult: null as { result: any; data: any } | null,
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
  const userMode = Object.keys(sprites)
  const useSymbolMode = 'symbol' in sprites

  const mode = userMode.reduce((prev, current) => {
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

  const spriter = new SVGSpriter({
    ...spriterConfig,
    dest: absoluteOutputPath,
    mode,
  })

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

    const dtsModules: string[] = []

    svgFiles
      .filter((item) => item.endsWith('.svg'))
      .map((item) => {
        dtsModules.push(
          pathe.join(SVG_SPRITE_PREFIX, 'symbol', item).replace('.svg', ''),
        )

        return pathe.join(process.cwd(), item)
      })
      .forEach((item) => {
        if (store.transformMap[item]) {
          return
        }

        const svgStr = fse.readFileSync(item, { encoding: 'utf-8' })
        const hash = crypto
          .createHash('md5')
          .update(svgStr, 'utf8')
          .digest('hex')
          .slice(0, 8)

        const svgId = `${pathe.parse(item).name}-${hash}`
        const svgHashPath = pathe.join(pathe.dirname(item), `${svgId}.svg`)

        spriter.add(svgHashPath, null, svgStr)
        store.transformMap[item] = svgId

        logger.debug('Add svg', item)
      })

    logger.log(`SVG sprite size: ${Object.keys(store.transformMap).length}`)
    logger.debug('Spriter compile start...')
    store.svgSpriteCompiledResult = await spriter.compileAsync()

    if (debug) {
      logger.debug('Spriter compile end')
    }

    async function declarations() {
      if (useSymbolMode) {
        logger.debug('Generate symbol declarations start...')
        generateDeclarations(
          dtsModules,
          sprites.symbol?.runtime.normalizeModuleType,
        )
        logger.debug('Generate symbol declarations end')
      }
    }

    async function writeFiles() {
      logger.debug('Write sprite files start...')
      await fse.emptyDir(absoluteOutputPath)
      for (const [_, modeResult] of Object.entries<{ string: BufferFile }>(
        store.svgSpriteCompiledResult!.result,
      )) {
        for (const resource of Object.values(modeResult)) {
          await fse.ensureDir(pathe.dirname(resource.path))
          await fse.writeFile(resource.path, resource.contents)
        }
      }
      logger.debug('Write sprite files end')
    }

    await Promise.all([declarations(), writeFiles()])

    store.compileComplete = true
  }

  return {
    store,
    mode,
    content,
    absolutePublicPath,
    absoluteOutputPath,
    spriter,
    outputDir,
    sprites,
    useSymbolMode,
    debug,
    scanDirs,
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
