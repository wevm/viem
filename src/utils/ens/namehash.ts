import { concat } from '../data/concat.js'
import { stringToBytes } from '../encoding/toBytes.js'
import { bytesToHex } from '../encoding/toHex.js'
import { keccak256 } from '../hash/keccak256.js'

/**
 * @description Hashes ENS name
 *
 * - Since ENS names prohibit certain forbidden characters (e.g. underscore) and have other validation rules, you likely want to [normalize ENS names](https://docs.ens.domains/contract-api-reference/name-processing#normalising-names) with [UTS-46 normalization](https://unicode.org/reports/tr46) before passing them to `namehash`. You can use the built-in [`normalize`](https://viem.sh/docs/ens/utilities/normalize.html) function for this.
 *
 * @example
 * namehash('wagmi-dev.eth')
 * '0xf246651c1b9a6b141d19c2604e9a58f567973833990f830d882534a747801359'
 *
 * @link https://eips.ethereum.org/EIPS/eip-137
 */
export function namehash(name: string) {
  let result = new Uint8Array(32).fill(0)
  if (!name) return bytesToHex(result)

  const labels = name.split('.')
  // Iterate in reverse order building up hash
  for (let i = labels.length - 1; i >= 0; i -= 1) {
    const hashed = keccak256(stringToBytes(labels[i]), 'bytes')
    result = keccak256(concat([result, hashed]), 'bytes')
  }

  return bytesToHex(result)
}
