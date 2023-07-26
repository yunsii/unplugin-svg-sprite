import SymbolSprite from '~svg-sprite/symbol'
import ViteSvg from '@/assets/raw/vite.svg?symbol'
import ReactSvg from '@/assets/raw/react.svg?symbol'
import VercelSvg from '@/assets/raw/vercel.svg?symbol'
import VercelCopySvg from '@/assets/vercel.svg?symbol'

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
