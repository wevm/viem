// Adapted from https://github.com/mafintosh/dns-packet
import type { ByteArray } from '../../types/misc.js'
import { stringToBytes } from '../encoding/toBytes.js'
import { encodeLabelhash } from './encodeLabelhash.js'
import { labelhash } from './labelhash.js'

/*
 * @description Encodes a DNS packet into a ByteArray containing a UDP payload.
 */
export function packetToBytes(packet: string): ByteArray {
  // strip leading and trailing `.`
  const value = packet.replace(/^\.|\.$/gm, '')
  if (value.length === 0) return new Uint8Array(1)

  const bytes = new Uint8Array(stringToBytes(value).byteLength + 2)

  let offset = 0
  const list = value.split('.')
  for (let i = 0; i < list.length; i++) {
    let encoded = stringToBytes(list[i])
    // if the length is > 255, make the encoded label value a labelhash
    // this is compatible with the universal resolver
    if (encoded.byteLength > 255)
      encoded = stringToBytes(encodeLabelhash(labelhash(list[i])))
    bytes[offset] = encoded.length
    bytes.set(encoded, offset + 1)
    offset += encoded.length + 1
  }

  if (bytes.byteLength !== offset + 1) return bytes.slice(0, offset + 1)

  return bytes
}
