<template>
  <SymbolSprite />
  <div>
    <img src="~/assets/vercel.svg" alt="Discover Nuxt 3" style="width: 48px" />
    <VercelSvg />
    <ViteSvg />
    <ReactSvg />
    <VercelSvg />
    <VercelCopySvg />
  </div>
</template>

<script setup>
import SymbolSprite from '~svg-sprite/symbol'
import VercelSvg from '~svg-sprite/symbol/assets/vercel'
import ViteSvg from '~svg-sprite/symbol/assets/raw/vite'
import ReactSvg from '~svg-sprite/symbol/assets/raw/react'
import VercelCopySvg from '~svg-sprite/symbol/assets/vercel'
</script>
