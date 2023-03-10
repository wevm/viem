import {
  Narrow,
  TypedData,
  TypedDataDomain,
  TypedDataToPrimitiveTypes,
} from 'abitype'
import { WalletClient } from '../../clients'
import { Account, Hex } from '../../types'
import { toHex } from '../../utils'

export type SignTypedDataParameters<
  TTypedData extends TypedData | { [key: string]: unknown } = TypedData,
  TPrimaryType extends string = string,
> = {
  account: Account
  domain?: TypedDataDomain
  types: Narrow<TTypedData>
  primaryType: GetPrimaryType<TTypedData, TPrimaryType>
} & GetMessage<TTypedData, TPrimaryType>

type GetPrimaryType<
  TTypedData extends TypedData | { [key: string]: unknown } = TypedData,
  TPrimaryType extends string = string,
> = TTypedData extends TypedData
  ? keyof TTypedData extends infer AbiFunctionNames
    ?
        | AbiFunctionNames
        | (TPrimaryType extends AbiFunctionNames ? TPrimaryType : never)
        | (TypedData extends TTypedData ? string : never)
    : never
  : TPrimaryType

type GetMessage<
  TTypedData extends TypedData | { [key: string]: unknown } = TypedData,
  TPrimaryType extends string = string,
  TSchema = TTypedData extends TypedData
    ? TypedDataToPrimitiveTypes<TTypedData>
    : { [key: string]: any },
  TMessage = TSchema[TPrimaryType extends keyof TSchema
    ? TPrimaryType
    : keyof TSchema],
> = { [key: string]: any } extends TMessage // Check if we were able to infer the shape of typed data
  ? {
      /**
       * Data to sign
       *
       * Use a [const assertion](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions) on {@link types} for type inference.
       */
      message: { [key: string]: unknown }
    }
  : {
      /** Data to sign */
      message: TMessage
    }

export type SignTypedDataReturnType = Hex

export async function signTypedData<
  TTypedData extends TypedData | { [key: string]: unknown },
  TPrimaryType extends string = string,
>(
  client: WalletClient,
  {
    account,
    domain,
    message,
    primaryType,
    types,
  }: SignTypedDataParameters<TTypedData, TPrimaryType>,
): Promise<SignTypedDataReturnType> {
  if (account.type === 'local')
    return account.signTypedData({
      domain,
      primaryType,
      types,
      message,
    } as Omit<SignTypedDataParameters<TTypedData>, 'account'>)
  return client.request({
    method: 'eth_signTypedData_v4',
    params: [
      account.address,
      JSON.stringify(
        { domain: domain ?? {}, primaryType, types, message },
        (_, value) => (typeof value === 'bigint' ? toHex(value) : value),
      ),
    ],
  })
}
