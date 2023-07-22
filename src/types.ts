export interface SymbolSpriteOptions {
  mode: 'symbol'
  runtime: {
    itemGenerator: string
    spriteGenerator: string
    /** 标准化雪碧图中模块类型，不指定类型为 any */
    normalizeModuleType?: (module: string) => string
    /**
     * 默认直接返回形如下列结构的雪碧图字符串给到 `spriteGenerator`：
     *
     * ```
     * <svg width="0" height="0" style="position:absolute">
     *  // <symbol>...</symbol/>
     * </svg>
     * ```
     *
     * 如有必要可自行处理。
     */
    transformSpriteData?: (raw: SvgSpriteSymbolData) => any
  }
}

export interface Options {
  content?: string[]
  publicPath?: string
  outputDir?: string
  sprites: SymbolSpriteOptions[]
  /**
   *
   *
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

export interface SvgSpriteSymbolItem
  extends Pick<SvgSpriteSymbolShape, 'width' | 'height'> {
  id: string
}
