import path from 'node:path'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  vue: {
    runtimeCompiler: true,
  },
  modules: [
    [
      '../../src/nuxt.ts',
      {
        content: ['assets/**/*.svg'],
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
            },
          },
          stack: {
            example: true,
          },
        },
      },
    ],
  ],
})
