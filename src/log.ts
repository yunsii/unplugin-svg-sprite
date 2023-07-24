import consola from 'consola'

import { PLUGIN_ATTR } from './core/constants'

export const logger = consola.withTag(PLUGIN_ATTR).withDefaults({
  level: 3,
})
