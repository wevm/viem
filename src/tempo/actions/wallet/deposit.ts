import type { Address, Errors } from 'ox'
import type { TransactionReceipt } from 'ox/tempo'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'

/**
 * Opens the wallet deposit flow with optional pre-filled deposit fields.
 *
 * @example
 * ```ts
 * import { Actions, Client, custom } from 'viem/tempo'
 *
 * const client = Client.create({
 *   transport: custom(window.ethereum!),
 * })
 *
 * const result = await Actions.wallet.deposit(client, {
 *   amount: '1.5',
 *   token: 'pathusd',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns Receipts for onchain deposit operations, when applicable.
 */
export async function deposit<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: deposit.Options = {},
): Promise<deposit.ReturnType> {
  return client.request(
    { method: 'wallet_deposit', params: [options] },
    { retryCount: 0 },
  ) as Promise<deposit.ReturnType>
}

export namespace deposit {
  export type Options = {
    /** Deposit address to pre-fill. */
    address?: Address.Address | undefined
    /** Human-readable amount to pre-fill (e.g. `"1.5"`). */
    amount?: string | undefined
    /** Source chain ID to pre-fill. */
    chainId?: number | undefined
    /** Human-readable account display name. */
    displayName?: string | undefined
    /**
     * Token to pre-fill, accepted as either a contract address or a supported
     * deposit token symbol. Omit to let the user choose.
     */
    token?: Address.Address | string | undefined
  }
  export type ReturnType =
    | {
        /** Receipts of any onchain operations performed during the deposit. */
        receipts?: readonly TransactionReceipt.TransactionReceipt[] | undefined
      }
    | undefined
  export type ErrorType = Errors.GlobalErrorType
}
