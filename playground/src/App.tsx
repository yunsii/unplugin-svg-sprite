import SymbolSprite from '~svg-sprite/symbol'
import ViteSvg from '@/assets/raw/vite.svg?symbol'
import ReactSvg from '@/assets/raw/react.svg?symbol'
import VercelSvg from '@/assets/raw/vercel.svg?symbol'
import VercelCopySvg from '@/assets/vercel.svg?symbol'

import './App.less'

function App() {
  return (
    <div>
      <SymbolSprite />
      <div className='flex'>
        <ReactSvg />
        <VercelSvg />
        <ViteSvg />
        <VercelCopySvg />
      </div>
    </div>
  )
}

export default App
