import { useEffect } from 'react'

import type React from 'react'

export interface ISvgSpriteItemProps {
  domStr: string
}

const SvgSpriteSymbol: React.FC<ISvgSpriteItemProps> = (props) => {
  const { domStr } = props

  useEffect(() => {
    const div = document.createElement('div')
    div.innerHTML = domStr

    // 如果通过 DOMParser 解析 svg 后挂载 vite.svg 渲染有问题，
    // 暂不清楚原因。
    const targetSvg = div.querySelector('svg')

    if (!targetSvg) {
      return
    }

    document.body.appendChild(targetSvg)
    return () => {
      document.body.removeChild(targetSvg)
    }
  }, [domStr])

  return null
}

export default SvgSpriteSymbol
