const path = require('node:path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  webpack: (config) => {
    config.plugins.push(
      require('../../dist/webpack.cjs').default({
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
    )

    return config
  },
}

module.exports = nextConfig
