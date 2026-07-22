import type { Errors, Hex } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { sendSync } from '../../../core/actions/transaction/sendSync.js'
import type { WriteSyncParameters } from '../../internal/types.js'
import * as WithdrawalSenderTag from '../../internal/WithdrawalSenderTag.js'
import { getAccount, getAddress, type ReceiptReturn } from './internal.js'
import { requestWithdrawal } from './requestWithdrawal.js'

/**
 * Requests a withdrawal from a zone to the parent Tempo chain, and waits for the transaction to be confirmed.
 *
 * @example
 * ```ts
 * import { Account, Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromSecp256k1('0x…'),
 *   transport: http(),
 * })
 *
 * const result = await Actions.zone.requestWithdrawalSync(client, {
 *   amount: 100n,
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and parent-chain withdrawal sender tag.
 */
export async function requestWithdrawalSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: requestWithdrawalSync.Options<account>,
): Promise<requestWithdrawalSync.ReturnType> {
  const { throwOnReceiptRevert = true } = options
  const receipt = await requestWithdrawal.inner(sendSync, client, {
    ...options,
    throwOnReceiptRevert,
  })
  const account = getAccount(options.account ?? client.account)
  return {
    receipt,
    senderTag: WithdrawalSenderTag.from({
      sender: getAddress(account),
      transactionHash: receipt.transactionHash,
    }),
  }
}

export namespace requestWithdrawalSync {
  export type Options<
    account extends Account.Account | undefined = Account.Account | undefined,
  > = requestWithdrawal.Options<account> & WriteSyncParameters
  export type ReturnType = ReceiptReturn<sendSync.ReturnType> & {
    /** Sender tag identifying the parent-chain `WithdrawalProcessed` event. */
    senderTag: Hex.Hex
  }
  export type ErrorType = Errors.GlobalErrorType
}
