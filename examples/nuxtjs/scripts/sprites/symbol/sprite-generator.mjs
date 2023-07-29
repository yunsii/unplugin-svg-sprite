import dedent from 'dedent'

export default function generator({ cwd, ...rest }) {
  return dedent`
    import SvgSpriteSymbol from '${cwd}/components/SvgSpriteSymbol'

    export default {
      components: {
        SvgSpriteSymbol
      },
      data() {
        return {
          sprite: ${JSON.stringify(rest)}
        }
      },
      template: \`
        <SvgSpriteSymbol v-bind:sprite="sprite" />
      \`
    }
  `
}
