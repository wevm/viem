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
 * @private Should not be used directly, please use `publicClient.verifyTypedData` instead
 * @param parameters
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
