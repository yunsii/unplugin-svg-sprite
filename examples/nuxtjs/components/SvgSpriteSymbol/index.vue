<script>
export default {
  props: {
    domStr: {
      type: String,
    },
  },
  mounted() {
    const div = document.createElement('div')
    div.innerHTML = this.domStr

    // 如果通过 DOMParser 解析 svg 后挂载 vite.svg 渲染有问题，
    // 暂不清楚原因。
    const targetSvg = div.querySelector('svg')
    console.log('🚀 ~ file: index.vue:15 ~ mounted ~ targetSvg:', targetSvg)

    if (!targetSvg) {
      return
    }

    targetSvg.setAttribute('width', '0')
    targetSvg.setAttribute('height', '0')
    targetSvg.style.position = 'absolute'
    targetSvg.style.bottom = '0'
    targetSvg.style.right = '0'

    document.body.appendChild(targetSvg)
  },
}
</script>
