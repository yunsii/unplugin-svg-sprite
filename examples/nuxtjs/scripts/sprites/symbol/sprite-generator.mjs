import dedent from 'dedent'

export default function generator({ cwd, domStr, ...rest }) {
  return dedent`
    import SvgSpriteSymbol from '${cwd}/components/SvgSpriteSymbol'

    export default {
      components: {
        SvgSpriteSymbol
      },
      data() {
        return {
          spriteProps: { domStr: \`${domStr}\`, ...${JSON.stringify(rest)}}
        }
      },
      template: \`
        <SvgSpriteSymbol v-bind:spriteProps="spriteProps" />
      \`
    }
  `
}
