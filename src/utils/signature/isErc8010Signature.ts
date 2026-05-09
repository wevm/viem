import { SignatureErc8010 } from 'ox/erc8010'
import type { ErrorType } from '../../errors/utils.js'
import type { Hex } from '../../types/misc.js'

export type IsErc8010SignatureParameters = Hex
export type IsErc8010SignatureReturnType = boolean
export type IsErc8010SignatureErrorType = ErrorType

/** Whether or not the signature is an ERC-8010 formatted signature. */
export function isErc8010Signature(
  signature: IsErc8010SignatureParameters,
): IsErc8010SignatureReturnType {
  return SignatureErc8010.validate(signature)
}
