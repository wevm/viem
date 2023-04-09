import type { Address, TypedData } from 'abitype'
import type { Hex, ByteArray, TypedDataDefinition } from '../../types/index.js'
import { getAddress, isAddressEqual } from '../index.js'
import { recoverTypedDataAddress } from './recoverTypedDataAddress.js'
import type { RecoverTypedDataAddressParameters } from './recoverTypedDataAddress.js'

export type VerifyTypedDataParameters<
  TTypedData extends TypedData | { [key: string]: unknown } = TypedData,
  TPrimaryType extends string = string,
> = TypedDataDefinition<TTypedData, TPrimaryType> & {
  address: Address
  signature: Hex | ByteArray
}

export type VerifyTypedDataReturnType = boolean

/**
 * Can be used to verify a typed data signed by a private key
 *
 * - Docs {@link https://viem.sh/docs/utilities/verifyTypedData.html}
 *
 * @dev Should not be used directly, please use `publicClient.verifyTypedData` instead
 * @param parameters - Object containing the typed data, signature and address to verify
 * @param parameters.address - The address to verify the typed data for
 * @param parameters.signature - The signature to verify
 * @param parameters.message - The typed data message
 * @param parameters.primaryType - The typed data primary type
 * @param parameters.types - The typed data types
 * @param parameters.domain - The typed data domain
 * @returns true if the typed data was signed by the private key of provided address (EOA)
 */
export async function verifyTypedData<
  TTypedData extends TypedData | { [key: string]: unknown },
  TPrimaryType extends string = string,
>({
  address,
  domain,
  message,
  primaryType,
  signature,
  types,
}: VerifyTypedDataParameters<
  TTypedData,
  TPrimaryType
>): Promise<VerifyTypedDataReturnType> {
  return isAddressEqual(
    getAddress(address),
    await recoverTypedDataAddress({
      domain,
      message,
      primaryType,
      signature,
      types,
    } as RecoverTypedDataAddressParameters),
  )
}
