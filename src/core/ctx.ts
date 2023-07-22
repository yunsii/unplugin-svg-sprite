import crypto from 'node:crypto'

import consola from 'consola'
import pathe from 'pathe'
import SVGSpriter from 'svg-sprite'
import fse from 'fs-extra'

import { existGenFileMode, isGenFileMode } from './helpers/sprite'

import type { BufferFile } from 'vinyl'
import type { Options } from '../types'

const OUTPUT_DIR = 'svg-sprite'

const SUPPORT_MODES = ['symbol'] as const

export function createContext(options: Options) {
  const {
    content = ['**/*.svg'],
    publicPath = 'public',
    outputDir = OUTPUT_DIR,
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

  const absoluteOutputPath = pathe.join(process.cwd(), publicPath, outputDir)

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
  const willGenFile = existGenFileMode(Object.keys(mode))

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
      `!${publicPath}/${outputDir}`,
      `!node_modules`,
    ])

    svgFiles
      .filter((item) => item.endsWith('.svg'))
      .map((item) => {
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

    if (willGenFile) {
      fse.emptyDirSync(absoluteOutputPath)
    }
    for (const [mode, modeResult] of Object.entries<{ string: BufferFile }>(
      store.svgSpriteCompiledResult.result,
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
  }

  return {
    store,
    mode,
    content,
    publicPath,
    spriter,
    outputDir,
    spriteSymbolOptions,
    absoluteOutputPath,
    willGenFile,
    debug,
    scanDirs,
  }
}
