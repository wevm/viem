import type { Address, Errors } from 'ox'
import type { TransactionReceipt } from 'ox/tempo'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'

/**
 * Opens the wallet swap flow with optional pre-filled swap fields.
 *
 * @example
 * ```ts
 * import { Actions, Client, custom } from 'viem/tempo'
 *
 * const client = Client.create({
 *   transport: custom(window.ethereum!),
 * })
 *
 * const { receipt } = await Actions.wallet.swap(client, {
 *   amount: '1.5',
 *   token: '0x…',
 *   type: 'sell',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The submitted swap receipt.
 */
export async function swap<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: swap.Options = {},
): Promise<swap.ReturnType> {
  return client.request(
    { method: 'wallet_swap', params: [options] },
    { retryCount: 0 },
  ) as Promise<swap.ReturnType>
}

export namespace swap {
  export type Options = {
    /** Human-readable amount to pre-fill (e.g. `"1.5"`). */
    amount?: string | undefined
    /**
     * Other side of the swap pair. For buys, this is the token to sell.
     * For sells, this is the token to buy.
     */
    pairToken?: Address.Address | undefined
    /** Maximum allowed slippage as a decimal fraction (e.g. `0.05`). */
    slippage?: number | undefined
    /** Token to buy or sell. Omit to let the user choose. */
    token?: Address.Address | undefined
    /** Whether the amount is an exact buy or sell amount. */
    type?: 'buy' | 'sell' | undefined
  }
  export type ReturnType = {
    /** Receipt of the submitted swap. */
    receipt: TransactionReceipt.TransactionReceipt
  }
  export type ErrorType = Errors.GlobalErrorType
}
