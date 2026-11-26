import type { ErrorType } from '../../errors/utils.js'
import type { Hex } from '../../types/misc.js'
import { sliceHex } from '../data/slice.js'

/** Magic bytes that end an ERC-8010 wrapped signature. */
const magicBytes =
  '0x8010801080108010801080108010801080108010801080108010801080108010'

export type IsErc8010SignatureParameters = Hex
export type IsErc8010SignatureReturnType = boolean
export type IsErc8010SignatureErrorType = ErrorType

/** Whether or not the signature is an ERC-8010 formatted signature. */
export function isErc8010Signature(
  signature: IsErc8010SignatureParameters,
): IsErc8010SignatureReturnType {
  return (
    typeof signature === 'string' && sliceHex(signature, -32) === magicBytes
  )
}
