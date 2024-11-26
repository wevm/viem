import { erc6492MagicBytes } from '../../constants/bytes.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Hex } from '../../types/misc.js'
import { type SliceHexErrorType, sliceHex } from '../data/slice.js'

export type IsErc6492SignatureParameters = Hex
export type IsErc6492SignatureReturnType = boolean
export type IsErc6492SignatureErrorType = SliceHexErrorType | ErrorType

/** Whether or not the signature is an ERC-6492 formatted signature. */
export function isErc6492Signature(
  signature: IsErc6492SignatureParameters,
): IsErc6492SignatureReturnType {
  return sliceHex(signature, -32) === erc6492MagicBytes
}
