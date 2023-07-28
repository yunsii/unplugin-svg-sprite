import consola from 'consola'

import { PLUGIN_ABBR } from './constants'

export const logger = consola.withTag(PLUGIN_ABBR).withDefaults({
  level: 3,
})
