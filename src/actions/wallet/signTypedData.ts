import type { TypedData, TypedDataParameter, TypedDataType } from 'abitype'
import type { Transport, WalletClient } from '../../clients'
import {
  AccountNotFoundError,
  BytesSizeMismatchError,
  InvalidAddressError,
} from '../../errors'
import type {
  Account,
  Chain,
  GetAccountParameter,
  Hex,
  TypedDataDefinition,
} from '../../types'
import {
  bytesRegex,
  integerRegex,
  isAddress,
  isHex,
  numberToHex,
  parseAccount,
  size,
  stringify,
} from '../../utils'

export type SignTypedDataParameters<
  TTypedData extends TypedData | { [key: string]: unknown } = TypedData,
  TPrimaryType extends string = string,
  TAccount extends Account | undefined = undefined,
> = GetAccountParameter<TAccount> &
  TypedDataDefinition<TTypedData, TPrimaryType>

export type SignTypedDataReturnType = Hex

export async function signTypedData<
  TTransport extends Transport,
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
  TTypedData extends TypedData | { [key: string]: unknown },
  TPrimaryType extends string = string,
>(
  client: WalletClient<TTransport, TChain, TAccount>,
  {
    account: account_ = client.account,
    domain,
    message,
    primaryType,
    types: types_,
  }: SignTypedDataParameters<TTypedData, TPrimaryType, TAccount>,
): Promise<SignTypedDataReturnType> {
  if (!account_)
    throw new AccountNotFoundError({
      docsPath: '/docs/actions/wallet/signTypedData',
    })
  const account = parseAccount(account_)

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
