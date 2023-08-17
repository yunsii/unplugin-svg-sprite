<template>
  <svg :width="props.item.width.outer" :height="props.item.height.outer">
    <use :href="props.item.href" :xlink:href="props.item.href" />
  </svg>
</template>

<script setup lang="ts">
import type { SvgSpriteSymbolItemProps } from '../../../../../src/types'

const props = defineProps<SvgSpriteSymbolItemProps>()

onMounted(() => {
  console.log('props.item', props.item)
})
</script>
