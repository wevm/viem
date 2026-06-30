import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'
import * as Hex from 'ox/Hex'

import * as Account from '../Account.js'
import type * as Client from '../Client.js'

type RequestOptions = Parameters<Client.Client['request']>[1]

/**
 * Calculates an [EIP-191](https://eips.ethereum.org/EIPS/eip-191) signature
 * over a personal message.
 *
 * - Local Accounts: signs locally (no JSON-RPC request).
 * - JSON-RPC Accounts: signs via `personal_sign`.
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
 * const signature = await Actions.signMessage(client, {
 *   message: 'hello world',
 * })
 * ```
 */
export async function signMessage(
  client: Client.Client,
  options: signMessage.Options,
): Promise<signMessage.ReturnType> {
  const {
    account: account_ = client.account,
    message,
    requestOptions,
  } = options

  if (!account_) throw new Account.NotFoundError()
  const account =
    typeof account_ === 'string' ? Account.from(account_) : account_

  if (account.type === 'local') return account.signMessage({ message })

  const data = (() => {
    if (typeof message === 'string') return Hex.fromString(message)
    if (message.raw instanceof Uint8Array) return Hex.fromBytes(message.raw)
    return message.raw
  })()

  return client.request(
    {
      method: 'personal_sign',
      params: [data, account.address],
    },
    { retryCount: 0, ...requestOptions },
  )
}

export declare namespace signMessage {
  type Options = {
    /** Account (or address) to sign with. @default client.account */
    account?: Account.Account | Address.Address | undefined
    /** Message to sign. */
    message: Account.SignableMessage
    /** Options to pass to the underlying RPC request. */
    requestOptions?: RequestOptions | undefined
  }

  type ReturnType = Hex.Hex

  type ErrorType = Account.NotFoundError | Errors.GlobalErrorType
}
