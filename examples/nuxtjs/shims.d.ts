declare module '~svg-sprite/symbol' {
  const SvgSpriteSymbol: () => any
  export default SvgSpriteSymbol
}

declare module '*.svg' {
  const SvgSpriteSymbolItem: (props: SVGAttributes & ReservedProps) => any
  export default SvgSpriteSymbolItem
}

declare module '*.svg?symbol' {
  const SvgSpriteSymbolItem: (props: SVGAttributes & ReservedProps) => any
  export default SvgSpriteSymbolItem
}
