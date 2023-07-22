const path = require('node:path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  webpack: (config) => {
    config.plugins.push(
      require('../../dist/webpack.cjs').default({
        debug: true,
        content: ['src/assets/**/*.svg'],
        sprites: [
          {
            mode: 'symbol',
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
        ],
      }),
    )

    return config
  },
}

module.exports = nextConfig
