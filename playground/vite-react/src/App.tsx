import SymbolSprite from 'unplugin-svg-sprite/symbol'

import ViteSvg from '@/assets/raw/vite.svg'
import ReactSvg from '@/assets/raw/react.svg'
import VercelSvg from '@/assets/raw/vercel.svg'
import VercelCopySvg from '@/assets/vercel.svg'

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
