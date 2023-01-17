export function isHex(value: any) {
  if (!value) return false
  if (typeof value !== 'string') return false
  return /^0x[0-9a-fA-F]*$/.test(value)
}
