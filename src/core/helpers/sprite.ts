import { SpriteMode } from '../constants'

export function isGenFileMode(mode: any) {
  return !([SpriteMode.Symbol] satisfies SpriteMode[]).includes(mode)
}

export function existGenFileMode(mode: string[]) {
  return mode.some((item) => isGenFileMode(item))
}
