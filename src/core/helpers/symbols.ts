import pathe from 'pathe'

import type { SvgSpriteCompiledResult, TransformData } from '../ctx'
import type { SvgSpriteSymbolData, SymbolSpriteOptions } from '../../types'

export async function transformSymbolSprite(
  data: SvgSpriteSymbolData,
  context: {
    userOptions: SymbolSpriteOptions
    pathname: string
  },
) {
  const { userOptions, pathname } = context

  const spriteGeneratorPath = `file:///${pathe.normalize(
    userOptions.runtime.spriteGenerator,
  )}`
  const _spriteGenerator = await import(spriteGeneratorPath)

  const spriteGenerator =
    typeof _spriteGenerator === 'function'
      ? _spriteGenerator
      : _spriteGenerator.default

  if (typeof spriteGenerator !== 'function') {
    throw new TypeError('Please export valid sprite generator function')
  }

  const spriteProps = userOptions.runtime.transformSpriteData
    ? userOptions.runtime.transformSpriteData(data, pathname)
    : {
        domStr: `
          <svg width="0" height="0" style="position:absolute">
            ${data.shapes.map((item) => item.svg).join('')}
          </svg>
        `.replace(/\n/g, ''),
      }

  const cwd = pathe.normalize(process.cwd())

  const transformedCode = spriteGenerator({
    ...spriteProps,
    cwd,
  })

  return { code: transformedCode, map: null }
}

export async function transformSymbolItem(
  svgAbsolutePath: string,
  context: {
    compiledResult: SvgSpriteCompiledResult
    userOptions: SymbolSpriteOptions
    transformData: TransformData
    staticPathname: string
  },
) {
  const { compiledResult, userOptions, transformData, staticPathname } = context

  const data: SvgSpriteSymbolData =
    transformData.type === 'static'
      ? compiledResult.static.data.symbol
      : compiledResult.dynamic.data.symbol
  const shapes = data.shapes

  const target = shapes.find((item) => item.name === transformData.runtimeId)

  if (!target) {
    throw new Error(`target shape of [${svgAbsolutePath}] not found`)
  }

  const getHref = () => {
    if (transformData.type === 'dynamic') {
      return `#${target.name}`
    }
    return `${staticPathname}#${target.name}`
  }

  const result = {
    href: getHref(),
    width: target.width,
    height: target.height,
  }

  const itemGeneratorPath = `file:///${pathe.normalize(
    userOptions.runtime.itemGenerator,
  )}`

  const _itemGenerator = await import(itemGeneratorPath)

  const itemGenerator =
    typeof _itemGenerator === 'function'
      ? _itemGenerator
      : _itemGenerator.default

  if (typeof itemGenerator !== 'function') {
    throw new TypeError('Please export valid item generator function')
  }

  const cwd = pathe.normalize(process.cwd())
  const transformedCode = itemGenerator({
    item: result,
    cwd,
  })

  return { code: transformedCode, map: null }
}
