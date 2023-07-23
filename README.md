# unplugin-svg-sprite

[![NPM version](https://img.shields.io/npm/v/unplugin-svg-sprite?color=a1b858&label=)](https://www.npmjs.com/package/unplugin-svg-sprite)

## Install

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

## References

- [svg-sprite](https://github.com/svg-sprite/svg-sprite)
- [How SVG Fragment Identifiers Work](https://css-tricks.com/svg-fragment-identifiers-work/)
