import { bytesToHex, stringToBytes } from '../encoding'
import { keccak256 } from '../hash'
import { normalize } from './normalize'

/**
 * @description Hashes label
 *
 * @example
 * labelhash('eth')
 * => '0x4f5b812789fc606be1b3b16908db13fc7a9adf7ca72641f84d75b47069d3d7f0'
 */
export function labelhash(label: string) {
  let result = new Uint8Array(32).fill(0)
  if (!label) return bytesToHex(result)
  return keccak256(stringToBytes(normalize(label)))
}
