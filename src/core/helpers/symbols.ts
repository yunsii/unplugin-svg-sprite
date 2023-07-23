import dedent from 'dedent'

import type { SvgSpriteSymbolData, SymbolSpriteOptions } from '../../types'

export async function transformSymbolSprite(
  data: SvgSpriteSymbolData,
  context: {
    userOptions: SymbolSpriteOptions
    pathname: string
  },
) {
  const { userOptions, pathname } = context

  const _spriteGenerator = await import(userOptions.runtime.spriteGenerator)

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
        domStr: dedent`
          <svg width="0" height="0" style="position:absolute">
            ${data.shapes.map((item) => item.svg).join('')}
          </svg>
      `,
      }

  const transformedCode = spriteGenerator({
    ...spriteProps,
    cwd: process.cwd(),
  })

  return { code: transformedCode, map: null }
}

export async function transformSymbolItem(
  svgAbsolutePath: string,
  context: {
    data: SvgSpriteSymbolData
    userOptions: SymbolSpriteOptions
    transformMap: Record<string, string>
  },
) {
  const { data, userOptions, transformMap } = context

  const shapes = data.shapes

  const target = shapes.find(
    (item) => item.name === transformMap[svgAbsolutePath],
  )

  if (!target) {
    throw new Error(`svg [${svgAbsolutePath}] not found`)
  }

  const result = {
    id: target.name,
    width: target.width,
    height: target.height,
  }

  const _itemGenerator = await import(userOptions.runtime.itemGenerator)

  const itemGenerator =
    typeof _itemGenerator === 'function'
      ? _itemGenerator
      : _itemGenerator.default

  if (typeof itemGenerator !== 'function') {
    throw new TypeError('Please export valid item generator function')
  }
  const transformedCode = itemGenerator({
    item: result,
    cwd: process.cwd(),
  })

  return { code: transformedCode, map: null }
}
