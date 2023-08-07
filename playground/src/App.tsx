import { useState } from 'react'

import SymbolSprite from '~svg-sprite/symbol'
import ViteSvg from '@/assets/raw/vite.svg'
import ReactSvg from '@/assets/raw/react.svg'
import VercelSvg from '@/assets/raw/vercel.svg'
import VercelCopySvg from '@/assets/vercel.svg'
import ReactCopy2Svg from '@/assets/react-copy-2.svg'

import './App.less'

function App() {
  const [count, setCount] = useState(0)
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>click {count}</button>
      <SymbolSprite />
      <div className='flex'>
        <ReactSvg />
        <VercelSvg />
        <ViteSvg />
        <VercelCopySvg />
        <ReactCopy2Svg />
      </div>
    </div>
  )
}

export default App
