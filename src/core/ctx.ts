import crypto from 'node:crypto'

import { get, isPlainObject } from 'lodash'
import consola from 'consola'
import pathe from 'pathe'
import SVGSpriter from 'svg-sprite'
import fse from 'fs-extra'

import { OUTPUT_DIR, SVG_SPRITE_PREFIX, SpriteMode } from './constants'
import { generateDeclarations } from './helpers/declarations'

import type { BufferFile } from 'vinyl'
import type { Options } from '../types'

export function createContext(options: Options) {
  const {
    content = ['**/*.svg'],
    publicDir = 'public',
    outputDir = OUTPUT_DIR,
    sprites = {},
    debug = false,
  } = options || {}

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
    dest: absoluteOutputPath,
    mode,
  })

  const store = {
    transformMap: {} as Record<string, string>,
    svgSpriteCompiledResult: null as { result: any; data: any } | null,
  }

  const scanDirs = async () => {
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

        if (debug) {
          consola.log('add svg', item)
        }
      })

    store.svgSpriteCompiledResult = await spriter.compileAsync()
    if (useSymbolMode) {
      generateDeclarations(
        dtsModules,
        sprites.symbol?.runtime.normalizeModuleType,
      )
    }

    fse.emptyDirSync(absoluteOutputPath)
    for (const [_, modeResult] of Object.entries<{ string: BufferFile }>(
      store.svgSpriteCompiledResult.result,
    )) {
      for (const resource of Object.values(modeResult)) {
        fse.ensureDirSync(pathe.dirname(resource.path))
        fse.writeFileSync(resource.path, resource.contents)
      }
    }
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
