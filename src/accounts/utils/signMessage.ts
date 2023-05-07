import type { Hex } from '../../types/misc.js'
import { hashMessage } from '../../utils/signature/hashMessage.js'

import { sign } from './sign.js'
import { signatureToHex } from './signatureToHex.js'

export type SignMessageParameters = {
  /** The message to sign. */
  message: string
  /** The private key to sign with. */
  privateKey: Hex
}
export type SignMessageReturnType = Hex

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
