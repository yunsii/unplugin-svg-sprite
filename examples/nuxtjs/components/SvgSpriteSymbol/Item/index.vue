<template>
  <svg>
    <use v-bind:xlink:href="this.href" />
  </svg>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
    },
  },
  data() {
    return {
      href: `#${this.item.id}`,
    }
  },
  mounted() {
    console.log('this.item', this.item)
  },
}
</script>
