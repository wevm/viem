import { ByteArray } from '../../types'
import { encodeBytes } from '../encoding'

/*
 * @description Encodes a DNS packet into a ByteArray containing a UDP payload.
 */
export function packetToBytes(packet: string): ByteArray {
  // Adapted from https://github.com/mafintosh/dns-packet
  function length(value: string) {
    if (value === '.' || value === '..') return 1
    return encodeBytes(value.replace(/^\.|\.$/gm, '')).length + 2
  }

  const bytes = new Uint8Array(length(packet))
  // strip leading and trailing `.`
  const value = packet.replace(/^\.|\.$/gm, '')
  if (!value.length) return bytes

  let offset = 0
  const list = value.split('.')
  for (let i = 0; i < list.length; i++) {
    const encoded = encodeBytes(list[i])
    bytes[offset] = encoded.length
    bytes.set(encoded, offset + 1)
    offset += encoded.length + 1
  }

  return bytes
}
