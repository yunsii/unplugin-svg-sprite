import { createUnplugin } from 'unplugin'
import pathe from 'pathe'
import chokidar from 'chokidar'

import { logger } from './log'
import { transformSymbolItem, transformSymbolSprite } from './helpers/symbols'
import { getContext } from './ctx'
import {
  PLUGIN_NAME,
  SVG_SPRITE_PREFIX,
  SVG_SPRITE_SYMBOL,
  SpriteMode,
} from './constants'

import type { Options, SvgSpriteSymbolData } from '../types'

let initialized = false
let isWatched = false

export default createUnplugin<Options>((options) => {
  const ctx = getContext(options)

  return {
    name: PLUGIN_NAME,
    async buildStart(this) {
      if (!initialized) {
        await ctx.api.scanDirs()
      }
      initialized = true
    },
    resolveId(id: string) {
      if (ctx.useSymbolMode && id.startsWith(SVG_SPRITE_PREFIX)) {
        logger.debug('Got resolveId', id)
        return id
      }
    },
    loadInclude(id) {
      if (ctx.useSymbolMode) {
        return id === SVG_SPRITE_SYMBOL
      }
    },
    async load(id) {
      const normalizeId = pathe.normalize(id)
      logger.debug('Got load id', normalizeId)
      await ctx.api.waitSpriteCompiled()

      // Only DYNAMIC sprite need inject sprite DOM
      const { data } = ctx.store.svgSpriteCompiledResult!.dynamic

      return transformSymbolSprite(data.symbol as SvgSpriteSymbolData, {
        userOptions: ctx.sprites.symbol!,
        pathname: pathe.join(
          ctx.path.absoluteOutputPath.replace(ctx.path.absolutePublicPath, ''),
          'dynamic',
          SpriteMode.Symbol,
          (data.symbol as SvgSpriteSymbolData).sprite,
        ),
      })
    },
    transformInclude(id) {
      if (!ctx.useSymbolMode) {
        return false
      }
      return ctx.useSymbolResourceQuery
        ? id.endsWith('.svg?symbol')
        : id.endsWith('.svg')
    },
    async transform(_, id) {
      const normalizeId = pathe.normalize(id)
      logger.debug('Got transform id', normalizeId)
      const realId = ctx.useSymbolResourceQuery
        ? pathe.normalize(id.replace('.svg?symbol', '.svg'))
        : normalizeId
      await ctx.api.waitSpriteCompiled()
      const target = ctx.store.transformMap.get(realId)

      if (!target) {
        throw new Error(`svg sprite [${realId}] not found`)
      }

      ctx.store.transformMap.set(realId, {
        ...target,
        used: true,
      })

      const compiledResult = ctx.store.svgSpriteCompiledResult!
      const staticPathname = pathe.join(
        ctx.path.absoluteOutputPath.replace(ctx.path.absolutePublicPath, ''),
        'static',
        SpriteMode.Symbol,
        (compiledResult.static.data.symbol as SvgSpriteSymbolData).sprite,
      )

      return transformSymbolItem(realId, {
        compiledResult,
        userOptions: ctx.sprites.symbol!,
        transformData: target,
        staticPathname,
      })
    },
    async buildEnd() {
      await ctx.api.compile({
        optimization: true,
      })
    },
    vite: {
      configureServer(server) {
        const { watcher } = server

        if (!isWatched) {
          watcher
            .on('add', (path) => {
              if (initialized) {
                ctx.api.handleSvgUpsert(path)
              }
            })
            .on('change', (path) => {
              if (initialized) {
                ctx.api.handleSvgUpsert(path)
              }
            })
            .on('unlink', (path) => {
              if (initialized) {
                ctx.api.handleSvgUnlink(path)
              }
            })
        }
        isWatched = true
      },
    },
    webpack: (compiler) => {
      if (isWatched) {
        return
      }
      compiler.hooks.make.tap.bind(
        compiler.hooks.make,
        `${PLUGIN_NAME}_watcher`,
      )(() => {
        const watcher = chokidar.watch(`${process.cwd()}/**/*.svg`, {
          ignored: [
            '**/.git/**',
            '**/node_modules/**',
            `**/${ctx.path.publicDir}/${ctx.path.outputDir}/**`,
            `${pathe.normalize(process.cwd())}/.*/**`,
          ],
          ignoreInitial: true,
          ignorePermissionErrors: true,
        })

        watcher
          .on('add', (path) => {
            if (initialized) {
              ctx.api.handleSvgUpsert(path)
            }
          })
          .on('change', (path) => {
            if (initialized) {
              ctx.api.handleSvgUpsert(path)
            }
          })
          .on('unlink', (path) => {
            if (initialized) {
              ctx.api.handleSvgUnlink(path)
            }
          })
      })
      isWatched = true
    },
  }
})
