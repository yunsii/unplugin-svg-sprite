import { useEffect, useRef, useState } from 'react'

import type { SvgSpriteSymbolProps } from '../../../../src/types'
import type React from 'react'

const SvgSpriteSymbol: React.FC<SvgSpriteSymbolProps> = (props) => {
  const { domStr: _domStr, pathname } = props

  const [domStr, setDomStr] = useState(_domStr)
  const fetchingRef = useRef(false)

  useEffect(() => {
    if (!domStr) {
      return
    }

    const div = document.createElement('div')
    div.innerHTML = domStr

    // It will render empty svg icon if mount svg sprite node by DOMParser.
    // Unclear for the time being.
    const targetSvg = div.querySelector('svg')

    if (!targetSvg) {
      return
    }

    targetSvg.setAttribute('width', '0')
    targetSvg.setAttribute('height', '0')
    targetSvg.style.position = 'absolute'
    targetSvg.style.bottom = '0'
    targetSvg.style.right = '0'

    document.body.appendChild(targetSvg)
    return () => {
      document.body.removeChild(targetSvg)
    }
  }, [domStr])

  useEffect(() => {
    async function run() {
      if (!pathname) {
        return
      }
      if (fetchingRef.current) {
        return
      }
      fetchingRef.current = true
      const response = await fetch(pathname)

      if (response.ok) {
        const data = await response.text()
        setDomStr(data)
      }
    }

    run()
  }, [pathname])

  return null
}

export default SvgSpriteSymbol
