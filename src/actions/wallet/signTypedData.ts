import type { TypedData } from 'abitype'
import type { Transport, WalletClient } from '../../clients/index.js'
import { AccountNotFoundError } from '../../errors/index.js'
import type {
  Account,
  Chain,
  GetAccountParameter,
  Hex,
  TypedDataDefinition,
} from '../../types/index.js'
import {
  isHex,
  parseAccount,
  stringify,
  validateTypedData,
} from '../../utils/index.js'

export type SignTypedDataParameters<
  TTypedData extends TypedData | { [key: string]: unknown } = TypedData,
  TPrimaryType extends string = string,
  TAccount extends Account | undefined = undefined,
> = GetAccountParameter<TAccount> &
  TypedDataDefinition<TTypedData, TPrimaryType>

export type SignTypedDataReturnType = Hex

export async function signTypedData<
  TTypedData extends TypedData | { [key: string]: unknown },
  TPrimaryType extends string,
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  client: WalletClient<Transport, TChain, TAccount>,
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
