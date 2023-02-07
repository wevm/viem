import { concat } from '../data'
import { bytesToHex, stringToBytes } from '../encoding'
import { keccak256 } from '../hash'
import { normalize } from './normalize'

/**
 * @description Hashes ENS name
 *
 * @example
 * namehash('wagmi-dev.eth')
 * '0xf246651c1b9a6b141d19c2604e9a58f567973833990f830d882534a747801359'
 *
 * @see https://eips.ethereum.org/EIPS/eip-137
 * @see https://docs.ens.domains/contract-api-reference/name-processing#hashing-names
 */
export function namehash(name: string) {
  let result = new Uint8Array(32).fill(0)
  if (!name) return bytesToHex(result)

  const labels = normalize(name).split('.')
  // Iterate in reverse order building up hash
  for (let i = labels.length - 1; i >= 0; i -= 1) {
    const hashed = keccak256(stringToBytes(labels[i]), 'bytes')
    result = keccak256(concat([result, hashed]), 'bytes')
  }

  return bytesToHex(result)
}
