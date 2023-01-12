export function isBytes(value: any) {
  if (!value) return false
  if (typeof value !== 'object') return false
  return (
    value.BYTES_PER_ELEMENT === 1 && value.constructor.name === 'Uint8Array'
  )
}
