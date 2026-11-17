import { Address } from 'ox'
import type { Authorization, Errors } from 'ox'

import * as Account from '../../Account.js'
import type * as Client from '../../Client.js'
import { getTransactionCount } from '../address/getTransactionCount.js'
import { getId } from '../chains/getId.js'

/**
 * Prepares an [EIP-7702 Authorization](https://eips.ethereum.org/EIPS/eip-7702)
 * object for signing. Fills the required fields of the Authorization object if
 * they are not provided (e.g. `nonce` and `chainId`).
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
 * const authorization = await Actions.wallet.prepareAuthorization(client, {
 *   address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 * })
 * ```
 */
export async function prepareAuthorization(
  client: Client.Client,
  options: prepareAuthorization.Options,
): Promise<prepareAuthorization.ReturnType> {
  const {
    account: account_ = client.account,
    address,
    chainId,
    nonce,
  } = options

  if (!account_) throw new Account.NotFoundError()
  const account =
    typeof account_ === 'string' ? Account.from(account_) : account_

  const executor = (() => {
    if (!options.executor) return undefined
    if (options.executor === 'self') return options.executor
    return typeof options.executor === 'string'
      ? Account.from(options.executor)
      : options.executor
  })()

  const chainId_ = chainId ?? client.chain?.id ?? (await getId(client))

  const nonce_ = await (async () => {
    if (typeof nonce === 'bigint') return nonce
    let value = BigInt(
      await getTransactionCount(client, {
        address: account.address,
        blockTag: 'pending',
      }),
    )
    if (
      executor === 'self' ||
      (typeof executor === 'object' &&
        Address.isEqual(executor.address, account.address))
    )
      value += 1n
    return value
  })()

  return { address, chainId: chainId_, nonce: nonce_ }
}

export declare namespace prepareAuthorization {
  type Options = {
    /** Account (or address) signing the Authorization. @default client.account */
    account?: Account.Account | Address.Address | undefined
    /** Address of the contract to delegate to. */
    address: Address.Address
    /** Chain ID to scope the Authorization to. @default client.chain.id */
    chainId?: number | undefined
    /**
     * Whether the EIP-7702 Transaction will be executed by the EOA (signing
     * this Authorization) or another Account.
     *
     * By default, it will be assumed that the EIP-7702 Transaction will be
     * executed by another Account.
     */
    executor?: 'self' | Account.Account | Address.Address | undefined
    /** Nonce of the Authorization. @default account nonce */
    nonce?: bigint | undefined
  }

  type ReturnType = Authorization.Authorization

  type ErrorType =
    | Account.NotFoundError
    | getId.ErrorType
    | getTransactionCount.ErrorType
    | Errors.GlobalErrorType
}
