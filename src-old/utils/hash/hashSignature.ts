import type { ErrorType } from '../../errors/utils.js'
import { type ToBytesErrorType, toBytes } from '../encoding/toBytes.js'
import { type Keccak256ErrorType, keccak256 } from './keccak256.js'

const hash = (value: string) => keccak256(toBytes(value))

export type HashSignatureErrorType =
  | Keccak256ErrorType
  | ToBytesErrorType
  | ErrorType

export function hashSignature(sig: string) {
  return hash(sig)
}
