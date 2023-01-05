import type { ByteArray, Hex } from '../../types'

const trimStart = [new RegExp(`^([0]*)(.*)$`), '$2'] as const
const trimEnd = [new RegExp(`^(.*?)([0]*)$`), '$1'] as const

type TrimOptions = {
  dir?: 'left' | 'right'
}

export function trimHex(hex_: Hex, { dir = 'left' }: TrimOptions = {}) {
  let hex = hex_
    .replace('0x', '')
    .replace(
      dir === 'right' ? trimEnd[0] : trimStart[0],
      dir === 'right' ? trimEnd[1] : trimStart[1],
    )
    [dir === 'right' ? 'trimEnd' : 'trimStart']()
  if (hex.length % 2 !== 0) {
    if (dir === 'right') hex = hex + '0'
  }
  return '0x' + hex
}

export function trimBytes(
  bytes: ByteArray,
  { dir = 'left' }: TrimOptions = {},
) {
  let sliceLength = 0
  for (let i = 0; i < bytes.length; i++) {
    if (bytes[dir === 'left' ? i : bytes.length - i - 1] === 0) sliceLength++
    else break
  }
  return dir === 'left'
    ? bytes.slice(sliceLength)
    : bytes.slice(0, bytes.length - sliceLength)
}

export function trim(
  hexOrBytes: Hex | ByteArray,
  { dir = 'left' }: TrimOptions = {},
) {
  if (typeof hexOrBytes === 'string') return trimHex(hexOrBytes, { dir })
  return trimBytes(hexOrBytes, { dir })
}
