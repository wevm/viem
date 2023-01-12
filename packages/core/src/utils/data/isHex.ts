export function isHex(value: string) {
  return /^0x[0-9a-fA-F]*$/.test(value)
}
