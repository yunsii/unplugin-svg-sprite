export const PLUGIN_NAME = 'unplugin-svg-sprite'

export const PLUGIN_ABBR = 'uss'

export const OUTPUT_DIR = 'svg-sprite'

export enum SpriteMode {
  Symbol = 'symbol',
  Stack = 'stack',
}

export const SVG_SPRITE_PREFIX = `~svg-sprite/`

export const SVG_SPRITE_SYMBOL = `${SVG_SPRITE_PREFIX}symbol`

export const IS_DEV = process.env.NODE_ENV === 'development'
