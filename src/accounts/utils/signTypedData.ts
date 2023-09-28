import type { TypedData } from 'abitype'

import type { Hex } from '../../types/misc.js'
import type { TypedDataDefinition } from '../../types/typedData.js'
import {
  type HashTypedDataErrorType,
  type HashTypedDataParameters,
  hashTypedData,
} from '../../utils/signature/hashTypedData.js'
import {
  type SignatureToHexErrorType,
  signatureToHex,
} from '../../utils/signature/signatureToHex.js'

import type { ErrorType } from '../../errors/utils.js'
import { type SignErrorType, sign } from './sign.js'

export type SignTypedDataParameters<
  TTypedData extends TypedData | { [key: string]: unknown } = TypedData,
  TPrimaryType extends string = string,
> = TypedDataDefinition<TTypedData, TPrimaryType> & {
  /** The private key to sign with. */
  privateKey: Hex
}

export type SignTypedDataReturnType = Hex

export type SignTypedDataErrorType =
  | HashTypedDataErrorType
  | SignErrorType
  | SignatureToHexErrorType
  | ErrorType

/**
 * @description Signs typed data and calculates an Ethereum-specific signature in [EIP-191 format](https://eips.ethereum.org/EIPS/eip-191):
 * `keccak256("\x19Ethereum Signed Message:\n" + len(message) + message))`.
 *
 * @returns The signature.
 */
export async function signTypedData<
  const TTypedData extends TypedData | { [key: string]: unknown },
  TPrimaryType extends string = string,
>({
  privateKey,
  ...typedData
}: SignTypedDataParameters<
  TTypedData,
  TPrimaryType
>): Promise<SignTypedDataReturnType> {
  const signature = await sign({
    hash: hashTypedData(typedData as HashTypedDataParameters),
    privateKey,
  })
  return signatureToHex(signature)
}
