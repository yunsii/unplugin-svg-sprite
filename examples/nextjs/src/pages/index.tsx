import { useState } from 'react'

import SymbolSprite from '~svg-sprite/symbol'
import ViteSvg from '@/assets/raw/vite.svg'
import ReactSvg from '@/assets/raw/react.svg'
import VercelSvg from '@/assets/raw/vercel.svg'
import VercelCopySvg from '@/assets/vercel.svg'
import ReactCopy2Svg from '@/assets/react-copy-2.svg'

export default function Home() {
  const [count, setCount] = useState(0)
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24`}
    >
      <button onClick={() => setCount(count + 1)}>click {count}</button>
      <SymbolSprite />
      <ViteSvg />
      <ReactSvg />
      <VercelSvg />
      <VercelCopySvg />
      <ReactCopy2Svg />
    </main>
  )
}
