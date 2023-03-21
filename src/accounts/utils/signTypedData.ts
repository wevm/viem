import type { TypedData } from 'abitype'

import type { Hex, TypedDataDefinition } from '../../types'
import { HashTypedDataParameters, hashTypedData } from '../../utils'
import { sign } from './sign'

export type SignTypedDataParameters<
  TTypedData extends TypedData | { [key: string]: unknown } = TypedData,
  TPrimaryType extends string = string,
> = TypedDataDefinition<TTypedData, TPrimaryType> & {
  privateKey: Hex
}

export type SignTypedDataReturnType = Hex

export async function signTypedData<
  TTypedData extends TypedData | { [key: string]: unknown },
  TPrimaryType extends string = string,
>({
  privateKey,
  ...typedData
}: SignTypedDataParameters<
  TTypedData,
  TPrimaryType
>): Promise<SignTypedDataReturnType> {
  return sign({
    hash: hashTypedData(typedData as HashTypedDataParameters),
    privateKey,
  })
}
