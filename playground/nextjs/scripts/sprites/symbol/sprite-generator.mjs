import dedent from 'dedent'

export default function generator({ domStr, cwd }) {
  return dedent`
    import React from 'react'
    import SvgSpriteSymbol from '${cwd}/src/components/SvgSpriteSymbol'

    export default function SvgSpriteSymbolWrapper(props) {
      return React.createElement(SvgSpriteSymbol, {
        ...props,
        domStr: \`${domStr}\`
      })
    }
  `
}
