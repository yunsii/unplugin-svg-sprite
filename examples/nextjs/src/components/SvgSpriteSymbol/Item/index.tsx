import React from 'react'

import type { SvgSpriteSymbolItemProps } from '../../../../../../src/types'

const SvgSpriteItem = (
  props: SvgSpriteSymbolItemProps,
  ref: React.LegacyRef<SVGSVGElement>,
) => {
  const { item, ...rest } = props

  return (
    <svg ref={ref} {...rest}>
      <use href={item.href} xlinkHref={item.href} />
    </svg>
  )
}

export default React.forwardRef(SvgSpriteItem)
