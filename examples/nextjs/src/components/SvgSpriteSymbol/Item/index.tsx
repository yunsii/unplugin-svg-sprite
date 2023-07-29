import React from 'react'

import type { SvgSpriteSymbolItem } from '../../../../../../src/types'

export interface ISvgSpriteItemProps {
  item: SvgSpriteSymbolItem
}

const SvgSpriteItem = (
  props: ISvgSpriteItemProps,
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
