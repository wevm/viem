import type { Address, Errors } from 'ox'
import type { TransactionReceipt } from 'ox/tempo'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import type { OneOf } from '../../../core/internal/types.js'

/**
 * Transfers a TIP-20 token. Discriminated on `editable`:
 *
 * - omitted or `false` (default): read-only. Uses an access key when one
 *   matches, otherwise falls back to a confirm dialog.
 * - `true`: editable. Opens the wallet send UI with the supplied fields
 *   pre-filled for the user to confirm or edit before signing.
 *
 * @example
 * ```ts
 * import { Actions, Client, custom } from 'viem/tempo'
 *
 * const client = Client.create({
 *   transport: custom(window.ethereum!),
 * })
 *
 * const { receipt } = await Actions.wallet.transfer(client, {
 *   amount: '1.5',
 *   to: '0x…',
 *   token: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The submitted transfer receipt and chain ID.
 */
export async function transfer<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: transfer.Options,
): Promise<transfer.ReturnType> {
  return client.request(
    { method: 'wallet_transfer', params: [options] },
    { retryCount: 0 },
  ) as Promise<transfer.ReturnType>
}

export namespace transfer {
  /** Read-only variant: uses an access key when one matches, otherwise shows a confirm dialog. */
  export type ReadOnly = {
    /** Human-readable amount to transfer (e.g. `"1.5"`). */
    amount: string
    /**
     * Skip the editable wallet UI. The wallet still shows a confirm dialog
     * when no matching access key is available.
     * @default false
     */
    editable?: false | undefined
    /**
     * Address to transfer tokens from. Defaults to the active account. When
     * set to a different address, the call uses `transferFrom` and requires
     * the active account to have an allowance from `from`.
     */
    from?: Address.Address | undefined
    /** UTF-8 memo (max 32 bytes) to attach to the transfer. */
    memo?: string | undefined
    /** Recipient address. */
    to: Address.Address
    /**
     * Token to transfer, accepted as either a contract address or a curated
     * tokenlist symbol (case-insensitive, e.g. `"pathusd"`).
     */
    token: Address.Address | string
  }
  /** Editable variant: opens the wallet send UI with optional pre-filled fields. */
  export type Editable = {
    /** Human-readable amount to pre-fill (e.g. `"1.5"`). */
    amount?: string | undefined
    /** Show the wallet UI for the user to confirm or edit. */
    editable: true
    /** UTF-8 memo (max 32 bytes) to attach to the transfer. */
    memo?: string | undefined
    /** Recipient address to pre-fill. */
    to?: Address.Address | undefined
    /**
     * Token to pre-fill, accepted as either a contract address or a curated
     * tokenlist symbol (case-insensitive, e.g. `"pathusd"`). Omit to let the
     * user choose.
     */
    token?: Address.Address | string | undefined
  }
  export type Options = {
    /** Chain ID. Defaults to the active chain. */
    chainId?: number | undefined
    /**
     * Fee payer override. `false` to disable the wallet's default fee payer,
     * a URL string to use a custom fee payer service.
     */
    feePayer?: boolean | string | undefined
  } & OneOf<ReadOnly | Editable>
  export type ReturnType = {
    /** Chain ID the transfer was submitted to. */
    chainId: number
    /** Receipt of the submitted transfer. */
    receipt: TransactionReceipt.TransactionReceipt
  }
  export type ErrorType = Errors.GlobalErrorType
}
