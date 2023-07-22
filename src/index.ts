import crypto from 'node:crypto'

import pathe from 'pathe'
import fse from 'fs-extra'
import { createUnplugin } from 'unplugin'
import SVGSpriter from 'svg-sprite'
import consola from 'consola'

import {
  SVG_SPRITE_SYMBOL_ID,
  transformSymbolItem,
  transformSymbolSprite,
} from './helpers/symbols'
import { checkExistGenFileMode, isGenFileMode } from './helpers/sprite'

import type { BufferFile } from 'vinyl'
import type { Options } from './types'

const outputDir = 'svg-sprite'

const SUPPORT_MODES = ['symbol'] as const

export default createUnplugin<Options | undefined>((options) => {
  const {
    content = ['**/*.svg'],
    publicPath = 'public',
    outputPath = outputDir,
    sprites = [],
    debug = false,
  } = options || {}

  if (!sprites.length) {
    throw new Error(
      `Pick a sprite mode required, supported [${SUPPORT_MODES.join(', ')}]`,
    )
  }

  const spriteSymbolOptions = sprites.find((item) => {
    return item.mode === 'symbol'
  })

  const absoluteOutputPath = pathe.join(process.cwd(), publicPath, outputPath)

  const mode = sprites
    .map((item) => item.mode)
    .reduce((prev, current) => {
      return {
        ...prev,
        [current]: {
          example: debug,
        },
      }
    }, {} as SVGSpriter.Mode)
  const existGenFileMode = checkExistGenFileMode(Object.keys(mode))

  const spriter = new SVGSpriter({
    dest: absoluteOutputPath,
    mode,
  })

  const transformMap: Record<string, string> = {}
  let svgSpriteCompiledResult: { result: any; data: any } | null = null

  return {
    name: 'unplugin-svg-sprite',
    buildStart: async () => {
      const { globbySync } = await import('globby')

      const svgFiles = globbySync([
        ...content,
        `!${publicPath}/${outputDir}`,
        `!node_modules`,
      ])

      svgFiles
        .filter((item) => item.endsWith('.svg'))
        .map((item) => {
          return pathe.join(process.cwd(), item)
        })
        .forEach((item) => {
          if (transformMap[item]) {
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
          transformMap[item] = svgId

          if (debug) {
            consola.log('add svg', item)
          }
        })

      svgSpriteCompiledResult = await spriter.compileAsync()

      if (existGenFileMode) {
        fse.emptyDirSync(absoluteOutputPath)
      }
      for (const [mode, modeResult] of Object.entries<{ string: BufferFile }>(
        svgSpriteCompiledResult.result,
      )) {
        // 非调试模式下，有些模式不用生成真实文件
        if (!isGenFileMode(mode) && !debug) {
          continue
        }
        for (const resource of Object.values(modeResult)) {
          fse.ensureDirSync(pathe.dirname(resource.path))
          fse.writeFileSync(resource.path, resource.contents)
        }
      }
    },
    resolveId(id: string) {
      if (id === SVG_SPRITE_SYMBOL_ID) {
        return id
      }
    },
    loadInclude(id) {
      if (!spriteSymbolOptions) {
        return false
      }
      return id === SVG_SPRITE_SYMBOL_ID
    },
    async load() {
      const { data } = svgSpriteCompiledResult!
      return transformSymbolSprite(data.symbol, spriteSymbolOptions!)
    },
    transformInclude(id) {
      if (!svgSpriteCompiledResult || !sprites.length || !spriteSymbolOptions) {
        return false
      }
      return id.endsWith('.svg')
    },
    async transform(this, _, id) {
      const { data } = svgSpriteCompiledResult!

      return transformSymbolItem(id, {
        data: data.symbol,
        userOptions: spriteSymbolOptions!,
        transformMap,
      })
    },
  }
})
