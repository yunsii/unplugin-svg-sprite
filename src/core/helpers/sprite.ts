export function isGenFileMode(mode: any) {
  return !['symbol'].includes(mode)
}

export function existGenFileMode(mode: string[]) {
  return mode.some((item) => isGenFileMode(item))
}
