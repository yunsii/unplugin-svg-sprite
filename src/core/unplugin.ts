import { createUnplugin } from 'unplugin'
import pathe from 'pathe'

import { transformSymbolItem, transformSymbolSprite } from './helpers/symbols'
import { createContext } from './ctx'
import { PLUGIN_NAME, SVG_SPRITE_PREFIX, SpriteMode } from './constants'

import type { Options } from '../types'

export default createUnplugin<Options>((options) => {
  const ctx = createContext(options)

  return {
    name: PLUGIN_NAME,
    buildStart: async () => {
      await ctx.scanDirs()
    },
    resolveId(id: string) {
      if (ctx.useSymbolMode && id.startsWith(SVG_SPRITE_PREFIX)) {
        return id
      }
    },
    loadInclude(id) {
      if (ctx.useSymbolMode && id.startsWith(SVG_SPRITE_PREFIX)) {
        return !!ctx.store.svgSpriteCompiledResult
      }
    },
    async load(id) {
      if (ctx.useSymbolMode) {
        const symbolPrefixPath = pathe.join(
          SVG_SPRITE_PREFIX,
          SpriteMode.Symbol,
        )

        if (id === symbolPrefixPath) {
          const { data } = ctx.store.svgSpriteCompiledResult!
          return transformSymbolSprite(data.symbol, ctx.sprites.symbol!)
        }

        const { data } = ctx.store.svgSpriteCompiledResult!

        const realId = pathe.join(
          process.cwd(),
          `${id.replace(pathe.join(symbolPrefixPath, '/'), '')}.svg`,
        )

        return transformSymbolItem(realId, {
          data: data.symbol,
          userOptions: ctx.sprites.symbol!,
          transformMap: ctx.store.transformMap,
        })
      }
    },
  }
})
