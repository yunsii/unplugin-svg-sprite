import path from 'node:path'

import { defineConfig } from 'vite'
import inspect from 'vite-plugin-inspect'
import tsconfigPaths from 'vite-tsconfig-paths'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error
// @ts-ignore
import unplugin from '../src/vite'

export default defineConfig({
  plugins: [
    inspect(),
    tsconfigPaths(),
    unplugin({
      debug: true,
      content: ['src/assets/**/*.svg'],
      sprites: {
        symbol: {
          runtime: {
            itemGenerator: path.join(
              __dirname,
              'scripts',
              'sprites',
              'symbol',
              'item-generator.mjs',
            ),
            spriteGenerator: path.join(
              __dirname,
              'scripts',
              'sprites',
              'symbol',
              'sprite-generator.mjs',
            ),
            normalizeModuleType: (module) => {
              return `
                  declare module '${module}' {
                    const SvgSpriteSymbol: (props: React.SVGProps<SVGSVGElement>) => React.ReactNode
                    export default SvgSpriteSymbol
                  }
                `
            },
            transformSpriteData: (raw, pathname) => {
              return {
                pathname,
              }
            },
          },
        },
        stack: {
          example: true,
        },
      },
    }),
  ],
})
