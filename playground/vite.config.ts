import path from 'node:path'

import { defineConfig } from 'vite'
import inspect from 'vite-plugin-inspect'
import tsconfigPaths from 'vite-tsconfig-paths'
import react from '@vitejs/plugin-react'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error
// @ts-ignore
import svgSprite from '../src/vite'

export default defineConfig({
  plugins: [
    inspect(),
    tsconfigPaths(),
    react(),
    svgSprite({
      // debug: true,
      content: ['src/assets/**/*.svg'],
      sprites: {
        symbol: {
          runtime: {
            // resourceQuery: true,
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
          },
        },
        stack: {
          example: true,
        },
      },
    }),
  ],
})
