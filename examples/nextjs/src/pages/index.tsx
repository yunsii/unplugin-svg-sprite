import SymbolSprite from '~svg-sprite/symbol'
import ViteSvg from '@/assets/raw/vite.svg'
import ReactSvg from '@/assets/raw/react.svg'
import VercelSvg from '@/assets/raw/vercel.svg'
import VercelCopySvg from '@/assets/vercel.svg'

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
