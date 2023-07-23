import dedent from 'dedent'

export default function generator({ domStr, cwd }) {
  return dedent`
    import SvgSpriteSymbol from '${cwd}/components/SvgSpriteSymbol'

    export default {
      components: {
        SvgSpriteSymbol
      },
      data() {
        return {
          domStr: \`${domStr}\`
        }
      },
      template: \`
        <SvgSpriteSymbol v-bind:domStr="domStr" />
      \`
    }
  `
}
