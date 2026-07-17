import type { Address, Errors, Hex } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { waitForReceipt } from '../../../core/actions/transaction/waitForReceipt.js'

/**
 * Funds an account with an initial amount of set tokens on Tempo's testnet, and waits for the transactions to be confirmed.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({
 *   transport: http(),
 * })
 *
 * const receipts = await Actions.faucet.fundSync(client, {
 *   account: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipts.
 */
export async function fundSync<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: fundSync.Options,
): Promise<fundSync.ReturnType<chain>> {
  const { account, timeout = 10_000 } = options
  const address = typeof account === 'string' ? account : account.address
  const hashes = (await client.request({
    method: 'tempo_fundAddress',
    params: [address],
  })) as readonly Hex.Hex[]
  return Promise.all(
    hashes.map(
      (hash) =>
        waitForReceipt(client, {
          checkReplacement: false,
          hash,
          timeout,
        }).receipt,
    ),
  )
}

export namespace fundSync {
  export type Options = {
    /** Account to fund. */
    account: Account.Account | Address.Address
    /** Timeout in ms before giving up waiting for receipts. */
    timeout?: number | undefined
  }
  export type ReturnType<
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
  > = readonly Chain.ExtractTransactionReceipt<chain>[]
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
