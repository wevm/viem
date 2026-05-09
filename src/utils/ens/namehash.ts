import type { ErrorType } from '../../errors/utils.js'
import type { ByteArray } from '../../types/misc.js'
import { type ConcatErrorType, concat } from '../data/concat.js'
import {
  type StringToBytesErrorType,
  stringToBytes,
  type ToBytesErrorType,
  toBytes,
} from '../encoding/toBytes.js'
import { type BytesToHexErrorType, bytesToHex } from '../encoding/toHex.js'
import { type Keccak256ErrorType, keccak256 } from '../hash/keccak256.js'
import {
  type EncodedLabelToLabelhashErrorType,
  encodedLabelToLabelhash,
} from './encodedLabelToLabelhash.js'

export type NamehashErrorType =
  | BytesToHexErrorType
  | EncodedLabelToLabelhashErrorType
  | ToBytesErrorType
  | Keccak256ErrorType
  | StringToBytesErrorType
  | ConcatErrorType
  | ErrorType

/**
 * @description Hashes ENS name
 *
 * - Since ENS names prohibit certain forbidden characters (e.g. underscore) and have other validation rules, you likely want to [normalize ENS names](https://docs.ens.domains/contract-api-reference/name-processing#normalising-names) with [UTS-46 normalization](https://unicode.org/reports/tr46) before passing them to `namehash`. You can use the built-in [`normalize`](https://viem.sh/docs/ens/utilities/normalize) function for this.
 *
 * @example
 * namehash('wevm.eth')
 * '0x08c85f2f4059e930c45a6aeff9dcd3bd95dc3c5c1cddef6a0626b31152248560'
 *
 * @link https://eips.ethereum.org/EIPS/eip-137
 */
export function namehash(name: string) {
  let result = new Uint8Array(32).fill(0) as ByteArray
  if (!name) return bytesToHex(result)

  const labels = name.split('.')
  // Iterate in reverse order building up hash
  for (let i = labels.length - 1; i >= 0; i -= 1) {
    const hashFromEncodedLabel = encodedLabelToLabelhash(labels[i])
    const hashed = hashFromEncodedLabel
      ? toBytes(hashFromEncodedLabel)
      : keccak256(stringToBytes(labels[i]), 'bytes')
    result = keccak256(concat([result, hashed]), 'bytes')
  }

  return bytesToHex(result)
}
