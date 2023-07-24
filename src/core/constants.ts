export const PLUGIN_NAME = 'unplugin-svg-sprite'

export const PLUGIN_ATTR = 'USS'

export const OUTPUT_DIR = 'svg-sprite'

export enum SpriteMode {
  Symbol = 'symbol',
  Stack = 'stack',
}

/**
 * PREFIX/mode/path
 *
 * ~svg-sprite/symbol/##/#
 */
export const SVG_SPRITE_PREFIX = '~svg-sprite/'
