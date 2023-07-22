import SymbolSprite from '~svg-sprite/symbol'
import ViteSvg from '~svg-sprite/symbol/src/assets/raw/vite'
import ReactSvg from '~svg-sprite/symbol/src/assets/raw/react'
import VercelSvg from '~svg-sprite/symbol/src/assets/raw/vercel'
import VercelCopySvg from '~svg-sprite/symbol/src/assets/vercel'

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24`}
    >
      <SymbolSprite />
      <ViteSvg />
      <ReactSvg />
      <VercelSvg />
      <VercelCopySvg />
    </main>
  )
}
