import type { TypedData } from 'abitype'
import type { Address, ByteArray, Hex, TypedDataDefinition } from '../../types'
import { hashTypedData } from './hashTypedData'
import { recoverAddress } from './recoverAddress'

export type RecoverTypedDataAddressParameters<
  TTypedData extends TypedData | { [key: string]: unknown } = TypedData,
  TPrimaryType extends string = string,
> = TypedDataDefinition<TTypedData, TPrimaryType> & {
  signature: Hex | ByteArray
}
export type RecoverTypedDataAddressReturnType = Address

export function recoverTypedDataAddress<
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
>): RecoverTypedDataAddressReturnType {
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
