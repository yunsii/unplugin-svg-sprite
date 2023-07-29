# unplugin-svg-sprite

[![npm version][npm-version-src]][npm-version-href] [![npm downloads][npm-downloads-src]][npm-downloads-href] [![License][license-src]][license-href]

## 🎉 Features

- 🦄 [Unified plugin](https://github.com/unjs/unplugin), support Vite/Rollup/Webpack/Nuxt/esbuild
- 🚀 Framework-agnostic, use whatever framework you like
- 😎 Import SVG file directly
- 😄 HMR supported (Vite/Webpack)
- 🤖 Detect duplicated SVG files
- 💎 SSR supported

> [🌱 Try it online](https://stackblitz.com/github/yunsii/unplugin-svg-sprite)

## 👀 Install

```bash
npm i unplugin-svg-sprite
```

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import svgSprite from 'unplugin-svg-sprite/vite'

export default defineConfig({
  plugins: [
    svgSprite({
      /* options */
    }),
  ],
})
```

Example: [`playground/`](./playground/)

<br></details>

<details>
<summary>Rollup</summary><br>

```ts
// rollup.config.js
import svgSprite from 'unplugin-svg-sprite/rollup'

export default {
  plugins: [
    svgSprite({
      /* options */
    }),
  ],
}
```

<br></details>

<details>
<summary>Webpack</summary><br>

```ts
// webpack.config.js
module.exports = {
  /* ... */
  plugins: [
    require('unplugin-svg-sprite/webpack')({
      /* options */
    }),
  ],
}
```

<br></details>

<details>
<summary>Nuxt</summary><br>

```ts
// nuxt.config.js
export default {
  vue: {
    runtimeCompiler: true,
  },
  // Nuxt 2 move `modules` into `buildModules`
  modules: [
    [
      'unplugin-svg-sprite/nuxt',
      {
        /* options */
      },
    ],
  ],
}
```

> This module works for both Nuxt 2 and [Nuxt Vite](https://github.com/nuxt/vite)

<br></details>

<details>
<summary>Vue CLI</summary><br>

```ts
// vue.config.js
module.exports = {
  configureWebpack: {
    plugins: [
      require('unplugin-svg-sprite/webpack')({
        /* options */
      }),
    ],
  },
}
```

<br></details>

<details>
<summary>esbuild</summary><br>

```ts
// esbuild.config.js
import { build } from 'esbuild'
import svgSprite from 'unplugin-svg-sprite/esbuild'

build({
  plugins: [svgSprite()],
})
```

<br></details>

## 🗺️ Road Map

[Check **todo** issues](https://github.com/yunsii/unplugin-svg-sprite/issues?q=is%3Aopen+label%3Atodo+sort%3Aupdated-desc)

## 📚 References

- [svg-sprite](https://github.com/svg-sprite/svg-sprite)
- [How SVG Fragment Identifiers Work](https://css-tricks.com/svg-fragment-identifiers-work/)

## License

[MIT](./LICENSE) License © 2023-PRESENT [yunsii](https://github.com/yunsii)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/unplugin-svg-sprite?color=a1b858&label=
[npm-version-href]: https://www.npmjs.com/package/unplugin-svg-sprite
[npm-downloads-src]: https://img.shields.io/npm/dm/unplugin-svg-sprite.svg?color=a1b858
[npm-downloads-href]: https://www.npmjs.com/package/unplugin-svg-sprite
[license-src]: https://img.shields.io/github/license/yunsii/unplugin-svg-sprite.svg?style=flat&colorB=a1b858
[license-href]: https://github.com/yunsii/unplugin-svg-sprite/blob/main/LICENSE
