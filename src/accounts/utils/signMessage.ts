import type { ErrorType } from '../../errors/utils.js'
import type { Hex, SignableMessage } from '../../types/misc.js'
import {
  type HashMessageErrorType,
  hashMessage,
} from '../../utils/signature/hashMessage.js'
import {
  type SignatureToHexErrorType,
  signatureToHex,
} from '../../utils/signature/signatureToHex.js'

import { type SignErrorType, sign } from './sign.js'

export type SignMessageParameters = {
  /** The message to sign. */
  message: SignableMessage
  /** The private key to sign with. */
  privateKey: Hex
}

export type SignMessageReturnType = Hex

export type SignMessageErrorType =
  | SignErrorType
  | HashMessageErrorType
  | SignatureToHexErrorType
  | ErrorType

/**
 * @description Calculates an Ethereum-specific signature in [EIP-191 format](https://eips.ethereum.org/EIPS/eip-191):
 * `keccak256("\x19Ethereum Signed Message:\n" + len(message) + message))`.
 *
 * @returns The signature.
 */
export async function signMessage({
  message,
  privateKey,
}: SignMessageParameters): Promise<SignMessageReturnType> {
  const signature = await sign({ hash: hashMessage(message), privateKey })
  return signatureToHex(signature)
}
