import type { Errors } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { sendSync } from '../../../core/actions/transaction/sendSync.js'
import type { WriteSyncParameters } from '../../internal/types.js'
import { encryptedDeposit } from './encryptedDeposit.js'
import type { ReceiptReturn } from './internal.js'

/**
 * Deposits tokens into a zone on the parent Tempo chain with encrypted recipient and memo, and waits for the transaction to be confirmed.
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
 * const result = await Actions.zone.encryptedDepositSync(client, {
 *   amount: 100n,
 *   token: '0x20c0000000000000000000000000000000000001',
 *   zoneId: 7,
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt.
 */
export async function encryptedDepositSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: encryptedDepositSync.Options<account>,
): Promise<encryptedDepositSync.ReturnType> {
  const { throwOnReceiptRevert = true } = options
  const receipt = await encryptedDeposit.inner(sendSync, client, {
    ...options,
    throwOnReceiptRevert,
  })
  return { receipt }
}

export namespace encryptedDepositSync {
  export type Options<
    account extends Account.Account | undefined = Account.Account | undefined,
  > = encryptedDeposit.Options<account> & WriteSyncParameters
  export type ReturnType = ReceiptReturn<sendSync.ReturnType>
  export type ErrorType = Errors.GlobalErrorType
}
