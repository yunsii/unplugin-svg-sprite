<template>
  <SymbolSprite />
  <div>
    <img src="/assets/vercel.svg" alt="Discover Nuxt 3" style="width: 48px" />
    <ViteSvg />
    <ReactSvg />
    <VercelSvg />
    <VercelCopySvg />
  </div>
</template>

<script setup>
import SymbolSprite from '~svg-sprite/symbol'
import VercelSvg from '@/assets/vercel.svg'
import ViteSvg from '@/assets/raw/vite.svg'
import ReactSvg from '@/assets/raw/react.svg'
import VercelCopySvg from '@/assets/vercel.svg'
</script>
