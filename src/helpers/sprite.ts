export function isGenFileMode(mode: any) {
  return !['symbol'].includes(mode)
}

export function checkExistGenFileMode(mode: string[]) {
  return mode.some((item) => isGenFileMode(item))
}
