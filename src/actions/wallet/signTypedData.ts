import type {
  Narrow,
  TypedData,
  TypedDataDomain,
  TypedDataParameter,
  TypedDataToPrimitiveTypes,
  TypedDataType,
} from 'abitype'
import type { WalletClient } from '../../clients'
import { BytesSizeMismatchError, InvalidAddressError } from '../../errors'
import type { Account, Hex } from '../../types'
import {
  bytesRegex,
  integerRegex,
  isAddress,
  isHex,
  numberToHex,
  size,
  stringify,
} from '../../utils'

export type SignTypedDataParameters<
  TTypedData extends TypedData | { [key: string]: unknown } = TypedData,
  TPrimaryType extends string = string,
> = {
  account: Account
} & TypedDataDefinition<TTypedData, TPrimaryType>

export type TypedDataDefinition<
  TTypedData extends TypedData | { [key: string]: unknown } = TypedData,
  TPrimaryType extends string = string,
> = {
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
  TPrimaryType extends string,
>(
  client: WalletClient,
  {
    account,
    domain,
    message,
    primaryType,
    types: types_,
  }: SignTypedDataParameters<TTypedData, TPrimaryType>,
): Promise<SignTypedDataReturnType> {
  const types = {
    EIP712Domain: [
      domain?.name && { name: 'name', type: 'string' },
      domain?.version && { name: 'version', type: 'string' },
      domain?.chainId && { name: 'chainId', type: 'uint256' },
      domain?.verifyingContract && {
        name: 'verifyingContract',
        type: 'address',
      },
      domain?.salt && { name: 'salt', type: 'bytes32' },
    ].filter(Boolean),
    ...(types_ as TTypedData),
  }

  // Need to do a runtime validation check on addresses, byte ranges, integer ranges, etc
  // as we can't statically check this with TypeScript.
  validateTypedData({
    domain,
    message,
    primaryType,
    types,
  } as TypedDataDefinition)

  if (account.type === 'local')
    return account.signTypedData({
      domain,
      primaryType,
      types,
      message,
    } as TypedDataDefinition)

  const typedData = stringify(
    { domain: domain ?? {}, primaryType, types, message },
    (_, value) => (isHex(value) ? value.toLowerCase() : value),
  )
  return client.request({
    method: 'eth_signTypedData_v4',
    params: [account.address, typedData],
  })
}

export function validateTypedData<
  TTypedData extends TypedData | { [key: string]: unknown },
  TPrimaryType extends string = string,
>({
  domain,
  message,
  primaryType,
  types: types_,
}: TypedDataDefinition<TTypedData, TPrimaryType>) {
  const types = types_ as TypedData

  const validateData = (
    struct: readonly TypedDataParameter[],
    value_: Record<string, unknown>,
  ) => {
    for (const param of struct) {
      const { name, type: type_ } = param
      const type = type_ as TypedDataType
      const value = value_[name]

      const integerMatch = type.match(integerRegex)
      if (
        integerMatch &&
        (typeof value === 'number' || typeof value === 'bigint')
      ) {
        const [_type, base, size_] = integerMatch
        // If number cannot be cast to a sized hex value, it is out of range
        // and will throw.
        numberToHex(value, {
          signed: base === 'int',
          size: parseInt(size_) / 8,
        })
      }

      if (type === 'address' && typeof value === 'string' && !isAddress(value))
        throw new InvalidAddressError({ address: value })

      const bytesMatch = type.match(bytesRegex)
      if (bytesMatch) {
        const [_type, size_] = bytesMatch
        if (size_ && size(value as Hex) !== parseInt(size_))
          throw new BytesSizeMismatchError({
            expectedSize: parseInt(size_),
            givenSize: size(value as Hex),
          })
      }

      const struct = types[type]
      if (struct) validateData(struct, value as Record<string, unknown>)
    }
  }

  // Validate domain types.
  if (types['EIP712Domain'] && domain)
    validateData(types['EIP712Domain'], domain)

  // Validate message types.
  const type = types[primaryType]
  validateData(type, message as Record<string, unknown>)
}
