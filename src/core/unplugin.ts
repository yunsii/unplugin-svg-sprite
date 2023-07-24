import { createUnplugin } from 'unplugin'
import pathe from 'pathe'
import consola from 'consola'

import { transformSymbolItem, transformSymbolSprite } from './helpers/symbols'
import { createContext } from './ctx'
import { PLUGIN_NAME, SVG_SPRITE_PREFIX, SpriteMode } from './constants'

import type { Options, SvgSpriteSymbolData } from '../types'

export default createUnplugin<Options>((options) => {
  const ctx = createContext(options)

  return {
    name: PLUGIN_NAME,
    buildStart: async () => {
      try {
        await ctx.scanDirs()
      } catch (err) {
        consola.error(err)
      }
    },
    resolveId(id: string) {
      if (ctx.useSymbolMode && id.startsWith(SVG_SPRITE_PREFIX)) {
        return id
      }
    },
    loadInclude(id) {
      return ctx.useSymbolMode && id.startsWith(SVG_SPRITE_PREFIX)
    },
    async load(id) {
      try {
        function waitSpriteCompiled() {
          return new Promise<void>((resolve, reject) => {
            if (ctx.store.svgSpriteCompiledResult) {
              resolve()
            }

            let count = 0

            function check() {
              setTimeout(() => {
                count += 1
                if (ctx.store.svgSpriteCompiledResult) {
                  resolve()
                  return
                }

                if (count >= 60) {
                  reject(
                    new Error(`Compile by svg-sprite timeout of ${count}s`),
                  )
                }

                check()
              }, 1e3)
            }

            check()
          })
        }

        await waitSpriteCompiled()

        const { data } = ctx.store.svgSpriteCompiledResult!

        if (ctx.debug) {
          consola.log('load id', id)
        }

        if (ctx.useSymbolMode) {
          const symbolPrefixPath = pathe.join(
            SVG_SPRITE_PREFIX,
            SpriteMode.Symbol,
          )

          if (id === symbolPrefixPath) {
            return transformSymbolSprite(data.symbol as SvgSpriteSymbolData, {
              userOptions: ctx.sprites.symbol!,
              pathname: pathe.join(
                ctx.absoluteOutputPath.replace(ctx.absolutePublicPath, ''),
                SpriteMode.Symbol,
                (data.symbol as SvgSpriteSymbolData).sprite,
              ),
            })
          }

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
      } catch (err) {
        consola.error(err)
      }
    },
  }
})
