import type { Address, TypedData } from 'abitype'

import type { ByteArray, Hex } from '../../types/misc.js'
import type { TypedDataDefinition } from '../../types/typedData.js'

import { hashTypedData } from './hashTypedData.js'
import { recoverAddress } from './recoverAddress.js'

export type RecoverTypedDataAddressParameters<
  TTypedData extends TypedData | { [key: string]: unknown } = TypedData,
  TPrimaryType extends string = string,
> = TypedDataDefinition<TTypedData, TPrimaryType> & {
  signature: Hex | ByteArray
}
export type RecoverTypedDataAddressReturnType = Address

export async function recoverTypedDataAddress<
  TTypedData extends TypedData | { [key: string]: unknown },
  TPrimaryType extends string = string,
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
