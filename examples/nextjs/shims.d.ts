declare module '~svg-sprite/symbol' {
  const SvgSpriteSymbol: React.FC
  export default SvgSpriteSymbol
}

declare module '*.svg' {
  const SvgSpriteSymbolItem: (
    props: React.SVGProps<SVGSVGElement>,
  ) => React.ReactElement
  export default SvgSpriteSymbolItem
}

declare module '*.svg?symbol' {
  const SvgSpriteSymbolItem: (
    props: React.SVGProps<SVGSVGElement>,
  ) => React.ReactElement
  export default SvgSpriteSymbolItem
}
