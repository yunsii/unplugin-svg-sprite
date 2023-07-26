<template>
  <SymbolSprite />
  <div>
    <img src="~/assets/vercel.svg" alt="Discover Nuxt 3" style="width: 48px" />
    <ViteSvg />
    <ReactSvg />
    <VercelSvg />
    <VercelCopySvg />
  </div>
</template>

<script setup>
import SymbolSprite from '~svg-sprite/symbol'
import VercelSvg from '@/assets/vercel.svg?symbol'
import ViteSvg from '@/assets/raw/vite.svg?symbol'
import ReactSvg from '@/assets/raw/react.svg?symbol'
import VercelCopySvg from '@/assets/vercel.svg?symbol'
</script>
