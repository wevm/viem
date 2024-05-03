// Adapted from https://github.com/mafintosh/dns-packet
import type { ErrorType } from '../../errors/utils.js'
import type { ByteArray } from '../../types/misc.js'
import {
  type StringToBytesErrorType,
  stringToBytes,
} from '../encoding/toBytes.js'
import {
  type EncodeLabelhashErrorType,
  encodeLabelhash,
} from './encodeLabelhash.js'
import { type LabelhashErrorType, labelhash } from './labelhash.js'

export type PacketToBytesErrorType =
  | EncodeLabelhashErrorType
  | LabelhashErrorType
  | StringToBytesErrorType
  | ErrorType

/*
 * @description Encodes a DNS packet into a ByteArray containing a UDP payload.
 *
 * @example
 * packetToBytes('awkweb.eth')
 * '0x0661776b7765620365746800'
 *
 * @see https://docs.ens.domains/resolution/names#dns
 *
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
