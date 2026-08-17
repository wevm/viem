import type { Errors } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { sendSync } from '../../../core/actions/transaction/sendSync.js'
import type { WriteSyncParameters } from '../../internal/types.js'
import type { ReceiptReturn } from './internal.js'
import { requestVerifiableWithdrawal } from './requestVerifiableWithdrawal.js'

/**
 * Requests a verifiable withdrawal from a zone to the parent Tempo chain, and waits for the transaction to be confirmed.
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
 * const result = await Actions.zone.requestVerifiableWithdrawalSync(client, {
 *   amount: 100n,
 *   revealTo: '0x02…',
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt.
 */
export async function requestVerifiableWithdrawalSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: requestVerifiableWithdrawalSync.Options<account>,
): Promise<requestVerifiableWithdrawalSync.ReturnType> {
  const { throwOnReceiptRevert = true } = options
  const receipt = await requestVerifiableWithdrawal.inner(sendSync, client, {
    ...options,
    throwOnReceiptRevert,
  })
  return { receipt }
}

export namespace requestVerifiableWithdrawalSync {
  export type Options<
    account extends Account.Account | undefined = Account.Account | undefined,
  > = requestVerifiableWithdrawal.Options<account> & WriteSyncParameters
  export type ReturnType = ReceiptReturn<sendSync.ReturnType>
  export type ErrorType = Errors.GlobalErrorType
}
