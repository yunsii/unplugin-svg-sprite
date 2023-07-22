import { createUnplugin } from 'unplugin'
import pathe from 'pathe'

import {
  SVG_SPRITE_SYMBOL_ID,
  transformSymbolItem,
  transformSymbolSprite,
} from './helpers/symbols'
import { createContext } from './ctx'
import { SVG_SPRITE_PREFIX } from './constants'

import type { Options } from '../types'

export default createUnplugin<Options>((options) => {
  const ctx = createContext(options)

  return {
    name: 'unplugin-svg-sprite',
    buildStart: async () => {
      await ctx.scanDirs()
    },
    resolveId(id: string) {
      if (id === SVG_SPRITE_SYMBOL_ID || id.startsWith(SVG_SPRITE_PREFIX)) {
        return id
      }
    },
    loadInclude(id) {
      if (!ctx.spriteSymbolOptions) {
        return false
      }
      if (id === SVG_SPRITE_SYMBOL_ID) {
        return true
      }

      if (id.startsWith(SVG_SPRITE_PREFIX)) {
        return !!ctx.store.svgSpriteCompiledResult && !!ctx.spriteSymbolOptions
      }
    },
    async load(id) {
      if (id === SVG_SPRITE_SYMBOL_ID) {
        const { data } = ctx.store.svgSpriteCompiledResult!
        return transformSymbolSprite(data.symbol, ctx.spriteSymbolOptions!)
      }

      const { data } = ctx.store.svgSpriteCompiledResult!

      const realId = pathe.join(
        process.cwd(),
        `${id.replace(pathe.join(SVG_SPRITE_PREFIX, 'symbol', '/'), '')}.svg`,
      )

      return transformSymbolItem(realId, {
        data: data.symbol,
        userOptions: ctx.spriteSymbolOptions!,
        transformMap: ctx.store.transformMap,
      })
    },
  }
})
