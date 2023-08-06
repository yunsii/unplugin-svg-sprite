import type { JsonObject } from 'type-fest'
import type SVGSpriter from 'svg-sprite'
import type { ModeConfig } from 'svg-sprite'

export interface SymbolSpriteOptions extends ModeConfig {
  runtime: {
    /** Whether use resourceQuery: ?symbol, default: false */
    resourceQuery?: boolean
    itemGenerator: string
    spriteGenerator: string
    /**
     * DYNAMIC svg node conditions, default nodes：
     *
     * - linearGradient
     * - radialGradient
     * - filter
     * - clipPath
     *
     * ref: https://stackoverflow.com/a/74173265/8335317
     */
    dynamicSvgNodes?: string[]
    /**
     * If you want inject SVG sprite directly, you can format dom string like:
     *
     * const domStr = `
     *   <svg width="0" height="0" style="position:absolute">
     *     ${data.shapes.map((item) => item.svg).join('')}
     *   </svg>
     * `.replace(/\n/g, '')
     *
     * ref: https://github.com/yunsii/unplugin-svg-sprite/blob/main/playground/src/components/SvgSpriteSymbol/index.tsx
     */
    transformSpriteData?: (
      pathname: string,
      domStr: string,
      rawData: SvgSpriteSymbolData,
    ) => JsonObject
  }
}

export interface Options {
  content?: string[]
  publicDir?: string
  outputDir?: string
  /**
   * ref: https://github.com/svg-sprite/svg-sprite/blob/main/docs/configuration.md#configuration
   *
   * You can custom shape.transform: https://github.com/svg-sprite/svg-sprite/blob/main/docs/configuration.md#shape-transformations
   */
  spriterConfig?: Omit<SVGSpriter.Config, 'dest' | 'mode' | 'log'>
  /** Support SVG sprite mode for now */
  sprites: {
    symbol?: SymbolSpriteOptions
    /**
     *ref: https://simurai.com/blog/2012/04/02/svg-stacks
     */
    stack?: boolean | ModeConfig
  }
  /**
   * Debug mode, default `false`
   */
  debug?: boolean
  /**
   * Silent mode, no log or debug message will to print, default: `false`
   */
  silent?: boolean
}

export interface SvgSpritePosition {
  x: number
  y: number
  xy: string
}

export interface SvgSpriteShape {
  name: string
  base: string
  width: { inner: number; outer: number }
  height: { inner: number; outer: number }
  position: {
    absolute: SvgSpritePosition
    relative: SvgSpritePosition
  }
}

export interface SvgSpriteSymbolShape {
  name: string
  base: string
  width: { inner: number; outer: number }
  height: { inner: number; outer: number }
  first: boolean
  last: boolean
  selector: {
    dimensions: {
      expression: string
      raw: string
      first: boolean
      last: boolean
    }[]
  }
  /** svg string wrapped by symbol node */
  svg: string
}

export interface SvgSpriteSymbolData {
  shapes: SvgSpriteSymbolShape[]
  date: string
  invert: () => void
  classname: () => void
  escape: () => void
  encodeHashSign: () => void
  mode: 'symbol'
  key: 'symbol'
  padding: {
    top: number
    right: number
    bottom: number
    left: number
  }
  sprite: string
  example: string
  inline: boolean
}

export interface SvgSpriteViewItem
  extends Pick<SvgSpriteShape, 'width' | 'height' | 'position'> {
  id: string
}

export interface SvgSpriteSymbolProps {
  domStr?: string
  /** In default, dynamic SVG sprite injected by pathname  */
  pathname?: string
}

export interface SvgSpriteSymbolItem
  extends Pick<SvgSpriteSymbolShape, 'width' | 'height'> {
  href: string
}

export interface SvgSpriteSymbolItemProps {
  item: SvgSpriteSymbolItem
}
