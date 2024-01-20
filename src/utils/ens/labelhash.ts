import type { ErrorType } from '../../errors/utils.js'
import {
  type StringToBytesErrorType,
  stringToBytes,
} from '../encoding/toBytes.js'
import { type BytesToHexErrorType, bytesToHex } from '../encoding/toHex.js'
import { type Keccak256ErrorType, keccak256 } from '../hash/keccak256.js'
import {
  type EncodedLabelToLabelhashErrorType,
  encodedLabelToLabelhash,
} from './encodedLabelToLabelhash.js'

export type LabelhashErrorType =
  | BytesToHexErrorType
  | EncodedLabelToLabelhashErrorType
  | Keccak256ErrorType
  | StringToBytesErrorType
  | ErrorType

/**
 * @description Hashes ENS label
 *
 * - Since ENS labels prohibit certain forbidden characters (e.g. underscore) and have other validation rules, you likely want to [normalize ENS labels](https://docs.ens.domains/contract-api-reference/name-processing#normalising-names) with [UTS-46 normalization](https://unicode.org/reports/tr46) before passing them to `labelhash`. You can use the built-in [`normalize`](https://viem.sh/docs/ens/utilities/normalize) function for this.
 *
 * @example
 * labelhash('eth')
 * '0x4f5b812789fc606be1b3b16908db13fc7a9adf7ca72641f84d75b47069d3d7f0'
 */
export function labelhash(label: string) {
  const result = new Uint8Array(32).fill(0)
  if (!label) return bytesToHex(result)
  return encodedLabelToLabelhash(label) || keccak256(stringToBytes(label))
}
