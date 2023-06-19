import type { Address, TypedData } from 'abitype'

import type { ByteArray, Hex } from '../../types/misc.js'
import type { TypedDataDefinition } from '../../types/typedData.js'

import { hashTypedData } from './hashTypedData.js'
import { recoverAddress } from './recoverAddress.js'

export type RecoverTypedDataAddressParameters<
  TTypedData extends TypedData | Record<string, unknown> = TypedData,
  TPrimaryType extends keyof TTypedData = keyof TTypedData,
> = TypedDataDefinition<TTypedData, TPrimaryType> & {
  signature: Hex | ByteArray
}
export type RecoverTypedDataAddressReturnType = Address

export async function recoverTypedDataAddress<
  const TTypedData extends TypedData | Record<string, unknown>, // `Record<string, unknown>` allows for non-const asserted types
  TPrimaryType extends keyof TTypedData,
>({
  domain,
  message,
  primaryType,
  signature,
  types,
}: RecoverTypedDataAddressParameters<
  TTypedData,
  TPrimaryType
>): Promise<RecoverTypedDataAddressReturnType> {
  return recoverAddress({
    hash: hashTypedData({
      domain,
      message,
      primaryType,
      types,
    } as RecoverTypedDataAddressParameters),
    signature,
  })
}
