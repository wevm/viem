// Adapted from https://github.com/mafintosh/dns-packet
import { ByteArray } from '../../types'
import { toBytes } from '../encoding'

/*
 * @description Encodes a DNS packet into a ByteArray containing a UDP payload.
 */
export function packetToBytes(packet: string): ByteArray {
  function length(value: string) {
    if (value === '.' || value === '..') return 1
    return toBytes(value.replace(/^\.|\.$/gm, '')).length + 2
  }

  const bytes = new Uint8Array(length(packet))
  // strip leading and trailing `.`
  const value = packet.replace(/^\.|\.$/gm, '')
  if (!value.length) return bytes

  let offset = 0
  const list = value.split('.')
  for (let i = 0; i < list.length; i++) {
    const encoded = toBytes(list[i])
    bytes[offset] = encoded.length
    bytes.set(encoded, offset + 1)
    offset += encoded.length + 1
  }

  return bytes
}
