import { createUnplugin } from 'unplugin'
import pathe from 'pathe'

import { logger } from '../log'

import { transformSymbolItem, transformSymbolSprite } from './helpers/symbols'
import { getContext } from './ctx'
import {
  PLUGIN_NAME,
  SVG_SPRITE_PREFIX,
  SVG_SPRITE_SYMBOL,
  SpriteMode,
} from './constants'

import type { Options, SvgSpriteSymbolData } from '../types'

export default createUnplugin<Options>((options) => {
  const ctx = getContext(options)

  return {
    name: PLUGIN_NAME,
    buildStart: async () => {
      await ctx.scanDirs()
    },
    resolveId(id: string) {
      if (ctx.useSymbolMode && id.startsWith(SVG_SPRITE_PREFIX)) {
        logger.debug('Got resolveId', id)
        return id
      }
    },
    loadInclude(id) {
      return ctx.useSymbolMode && id.startsWith(SVG_SPRITE_PREFIX)
    },
    async load(id) {
      logger.debug('Got load id', id)

      await ctx.waitSpriteCompiled()

      // 只有动态雪碧图才需要加载运行时通过 JS 加载雪碧图本体
      const { data } = ctx.store.svgSpriteCompiledResult!.dynamic

      if (ctx.useSymbolMode && id === SVG_SPRITE_SYMBOL) {
        return transformSymbolSprite(data.symbol as SvgSpriteSymbolData, {
          userOptions: ctx.sprites.symbol!,
          pathname: pathe.join(
            ctx.absoluteOutputPath.replace(ctx.absolutePublicPath, ''),
            'dynamic',
            SpriteMode.Symbol,
            (data.symbol as SvgSpriteSymbolData).sprite,
          ),
        })
      }
    },
    transformInclude(id) {
      return ctx.useSymbolMode && id.endsWith('.svg')
    },
    async transform(_, id) {
      logger.debug('Got transform id', id)
      await ctx.waitSpriteCompiled()
      const target = ctx.store.transformMap.get(id)

      if (!target) {
        throw new Error(`svg sprite [${id}] not found`)
      }

      const compiledResult = ctx.store.svgSpriteCompiledResult!
      const staticPathname = pathe.join(
        ctx.absoluteOutputPath.replace(ctx.absolutePublicPath, ''),
        'static',
        SpriteMode.Symbol,
        (compiledResult.static.data.symbol as SvgSpriteSymbolData).sprite,
      )

      logger.debug(`Static pathname: ${staticPathname}`)
      return transformSymbolItem(id, {
        compiledResult,
        userOptions: ctx.sprites.symbol!,
        transformData: target,
        staticPathname,
      })
    },
  }
})
