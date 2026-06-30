import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'
import type * as Hex from 'ox/Hex'
import * as TypedData from 'ox/TypedData'

import * as Account from '../Account.js'
import type * as Client from '../Client.js'

type RequestOptions = Parameters<Client.Client['request']>[1]

/**
 * Signs [EIP-712](https://eips.ethereum.org/EIPS/eip-712) typed data.
 *
 * - Local Accounts: signs locally (no JSON-RPC request).
 * - JSON-RPC Accounts: signs via `eth_signTypedData_v4`.
 *
 * @example
 * ```ts
 * import { Account, Actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   account: Account.fromPrivateKey('0x…'),
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const signature = await Actions.signTypedData(client, {
 *   domain: { name: 'Ether Mail', version: '1' },
 *   types: {
 *     Mail: [{ name: 'contents', type: 'string' }],
 *   },
 *   primaryType: 'Mail',
 *   message: { contents: 'hello world' },
 * })
 * ```
 */
export async function signTypedData<
  const typedData extends TypedData.TypedData | Record<string, unknown>,
  primaryType extends keyof typedData | 'EIP712Domain' = keyof typedData,
>(
  client: Client.Client,
  options: signTypedData.Options<typedData, primaryType>,
): Promise<signTypedData.ReturnType> {
  const {
    account: account_ = client.account,
    requestOptions,
    ...value
  } = options as signTypedData.Options

  if (!account_) throw new Account.NotFoundError()
  const account =
    typeof account_ === 'string' ? Account.from(account_) : account_

  TypedData.assert(value)

  if (account.type === 'local')
    return account.signTypedData(value as TypedData.encode.Value)

  return client.request(
    {
      method: 'eth_signTypedData_v4',
      params: [account.address, TypedData.serialize(value)],
    },
    { retryCount: 0, ...requestOptions },
  )
}

export declare namespace signTypedData {
  type Options<
    typedData extends TypedData.TypedData | Record<string, unknown> =
      TypedData.TypedData,
    primaryType extends keyof typedData | 'EIP712Domain' = keyof typedData,
  > = TypedData.encode.Value<typedData, primaryType> & {
    /** Account (or address) to sign with. @default client.account */
    account?: Account.Account | Address.Address | undefined
    /** Options to pass to the underlying RPC request. */
    requestOptions?: RequestOptions | undefined
  }

  type ReturnType = Hex.Hex

  type ErrorType = Account.NotFoundError | Errors.GlobalErrorType
}
