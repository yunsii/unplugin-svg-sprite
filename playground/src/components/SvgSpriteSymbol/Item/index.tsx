import React from 'react'

import type { SvgSpriteSymbolItem } from '../../../../../src/types'

export interface ISvgSpriteItemProps {
  item: SvgSpriteSymbolItem
}

const SvgSpriteItem = (
  props: ISvgSpriteItemProps,
  ref: React.LegacyRef<SVGSVGElement>,
) => {
  const { item, ...rest } = props

  return (
    <svg
      ref={ref}
      {...rest}
      viewBox={`0 0 ${item.width.outer} ${item.height.outer}`}
    >
      <use xlinkHref={item.xlinkHref} />
    </svg>
  )
}

export default React.forwardRef(SvgSpriteItem)
