declare module '~svg-sprite/symbol' {
  const SvgSpriteSymbol: React.FC
  export default SvgSpriteSymbol
}

declare module '*.svg' {
  const SvgSpriteSymbol: (
    props: React.SVGProps<SVGSVGElement>,
  ) => React.ReactNode
  export default SvgSpriteSymbol
}
