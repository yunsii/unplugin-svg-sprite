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
      <div className='grid grid-cols-4'>
        <span
          className='i-mdi--home transition-all duration-200 hover:ih-mdi--arrow text-red-500 w-16 h-16'
          style={{ verticalAlign: '-0.125em' }}
        />
        <span
          className='i--mdi i--mdi--home w-16 h-16'
          style={{ verticalAlign: '-0.125em' }}
        />
        <span
          className='i-[custom--react] w-16 h-16'
          style={{ verticalAlign: '-0.125em' }}
        />
        <span
          className='i-[custom--vite] w-16 h-16'
          style={{ verticalAlign: '-0.125em' }}
        />
        <span
          className='after:i-[custom--vite] w-16 h-16'
          style={{ verticalAlign: '-0.125em' }}
        />
        <span
          className='i-mdi-home hover:i-mdi-arrow w-16 h-16'
          style={{ verticalAlign: '-0.125em' }}
        />
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
