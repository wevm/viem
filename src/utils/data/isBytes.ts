import type { ByteArray } from '../../types/misc.js'

export function isBytes(value: unknown): value is ByteArray {
  if (!value) return false
  if (typeof value !== 'object') return false
  if (!('BYTES_PER_ELEMENT' in value)) return false
  return (
    value.BYTES_PER_ELEMENT === 1 && value.constructor.name === 'Uint8Array'
  )
}
