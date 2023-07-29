import type { JsonObject } from 'type-fest'
import type SVGSpriter from 'svg-sprite'
import type { ModeConfig } from 'svg-sprite'

export interface SymbolSpriteOptions extends ModeConfig {
  runtime: {
    itemGenerator: string
    spriteGenerator: string
    /**
     * 包含哪些节点的 SVG 算是动态 SVG，可添加额外判断条件，以下节点为默认值：
     * - linearGradient
     * - radialGradient
     * - filter
     * - clipPath
     */
    dynamicSvgNodes?: string[]
    /**
     * 默认直接返回形如下列结构的雪碧图字符串 **domStr** 给到 `spriteGenerator`：
     *
     * ```
     * <svg width="0" height="0" style="position:absolute">
     *  // <symbol>...</symbol/>
     * </svg>
     * ```
     *
     * 如果你想通过外链的方式，可让函数直接返回 `{ pathname }`，此时，应避免再次注入 domStr。
     * 再在 SvgSpriteSymbol 中处理，参考处理方式 https://github.com/yunsii/unplugin-svg-sprite/blob/main/playground/src/components/SvgSpriteSymbol/index.tsx
     */
    transformSpriteData?: (
      raw: SvgSpriteSymbolData,
      pathname: string,
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
   * 可自定义 shape.transform: https://github.com/svg-sprite/svg-sprite/blob/main/docs/configuration.md#shape-transformations
   */
  spriterConfig?: Omit<SVGSpriter.Config, 'dest' | 'mode'>
  /** 当前支持的雪碧图配置 */
  sprites: {
    symbol?: SymbolSpriteOptions
    /**
     *ref: https://simurai.com/blog/2012/04/02/svg-stacks
     */
    stack?: boolean | ModeConfig
  }
  /**
   * 是否开启 Debug 模式，默认 false
   *
   * 开启后：
   *
   * - 输出扫描到的 SVG
   */
  debug?: boolean
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
  /** symbol 节点包裹的 SVG 字符串 */
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
  pathname?: string
}

export interface SvgSpriteSymbolItem
  extends Pick<SvgSpriteSymbolShape, 'width' | 'height'> {
  href: string
}

export interface SvgSpriteSymbolItemProps {
  item: SvgSpriteSymbolItem
}
