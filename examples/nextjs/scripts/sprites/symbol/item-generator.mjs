import dedent from 'dedent'

export default function generator({ item, cwd }) {
  return dedent`
    import React from 'react'
    import SvgSpriteItem from '${cwd}/src/components/SvgSpriteSymbol/Item'

    export default React.forwardRef((props, ref) => {
      return React.createElement(SvgSpriteItem, {
        ref,
        ...props,
        item: ${JSON.stringify(item)},
      })
    })
  `
}
