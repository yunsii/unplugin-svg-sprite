import { createUnplugin } from 'unplugin'

import {
  SVG_SPRITE_SYMBOL_ID,
  transformSymbolItem,
  transformSymbolSprite,
} from './helpers/symbols'
import { createContext } from './ctx'

import type { Options } from '../types'

export default createUnplugin<Options>((options) => {
  const ctx = createContext(options)

  return {
    name: 'unplugin-svg-sprite',
    buildStart: async () => {
      await ctx.scanDirs()
    },
    resolveId(id: string) {
      if (id === SVG_SPRITE_SYMBOL_ID) {
        return id
      }
    },
    loadInclude(id) {
      if (!ctx.spriteSymbolOptions) {
        return false
      }
      return id === SVG_SPRITE_SYMBOL_ID
    },
    async load() {
      const { data } = ctx.store.svgSpriteCompiledResult!
      return transformSymbolSprite(data.symbol, ctx.spriteSymbolOptions!)
    },
    transformInclude(id) {
      if (!ctx.store.svgSpriteCompiledResult || !ctx.spriteSymbolOptions) {
        return false
      }
      return id.endsWith('.svg')
    },
    async transform(this, _, id) {
      const { data } = ctx.store.svgSpriteCompiledResult!

      return transformSymbolItem(id, {
        data: data.symbol,
        userOptions: ctx.spriteSymbolOptions!,
        transformMap: ctx.store.transformMap,
      })
    },
  }
})
