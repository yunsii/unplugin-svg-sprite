import SymbolSprite from 'unplugin-svg-sprite/symbol'

import ViteSvg from '~svg-sprite/symbol/src/assets/raw/vite'
import ReactSvg from '~svg-sprite/symbol/src/assets/raw/react'
import VercelSvg from '~svg-sprite/symbol/src/assets/raw/vercel'
import VercelCopySvg from '~svg-sprite/symbol/src/assets/vercel'

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
