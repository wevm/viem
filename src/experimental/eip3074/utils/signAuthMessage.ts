import { type SignErrorType, sign } from '../../../accounts/utils/sign.js'
import type { ErrorType } from '../../../errors/utils.js'
import type { Hex } from '../../../types/misc.js'
import { keccak256 } from '../../../utils/hash/keccak256.js'
import {
  type SerializeSignatureErrorType,
  serializeSignature,
} from '../../../utils/signature/serializeSignature.js'
import {
  type ToAuthMessageErrorType,
  type ToAuthMessageParameters,
  toAuthMessage,
} from './toAuthMessage.js'

export type SignAuthMessageParameters = ToAuthMessageParameters & {
  /** The private key to sign with. */
  privateKey: Hex
}

export type SignAuthMessageReturnType = Hex

export type SignAuthMessageErrorType =
  | SignErrorType
  | ToAuthMessageErrorType
  | SerializeSignatureErrorType
  | ErrorType

/**
 * Computes a EIP-3074 authorization signature in format: `keccak256(MAGIC || chainId || nonce || invokerAddress || commit))`.
 */
export async function signAuthMessage(
  parameters: SignAuthMessageParameters,
): Promise<SignAuthMessageReturnType> {
  const { privateKey } = parameters
  const signature = await sign({
    hash: keccak256(toAuthMessage(parameters)),
    privateKey,
  })
  return serializeSignature(signature)
}
