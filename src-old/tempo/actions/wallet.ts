import type { Address } from 'abitype'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType as CoreErrorType } from '../../errors/utils.js'
import type { Chain } from '../../types/chain.js'
import type { OneOf } from '../../types/utils.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'
import type { TransactionReceipt } from '../Transaction.js'

/**
 * Transfers a TIP-20 token. Discriminated on `editable`:
 *
 * - omitted or `false` (default): read-only. Uses an access key when
 *   one matches (signs without showing the wallet UI), otherwise falls
 *   back to a confirm dialog the user has to approve.
 * - `true`: editable. Opens the wallet send UI with the supplied fields
 *   pre-filled for the user to confirm or edit before signing.
 *
 * @example
 * ```ts
 * import { createClient, custom } from 'viem'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   transport: custom(window.ethereum),
 * })
 *
 * // Read-only (no UI when an access key matches)
 * const { receipt } = await Actions.wallet.transfer(client, {
 *   amount: '1.5',
 *   to: '0x...',
 *   token: '0x...',
 * })
 *
 * // Editable (opens wallet UI)
 * await Actions.wallet.transfer(client, {
 *   editable: true,
 *   token: 'pathUSD',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The submitted transfer receipt and chain ID.
 */
export async function transfer<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: transfer.Parameters,
): Promise<transfer.ReturnValue> {
  return client.request<{
    Method: 'wallet_transfer'
    Parameters: [transfer.Parameters]
    ReturnType: transfer.ReturnValue
  }>(
    {
      method: 'wallet_transfer',
      params: [parameters],
    },
    { retryCount: 0 },
  )
}

export declare namespace transfer {
  /**
   * Read-only variant — uses an access key when one matches, otherwise
   * shows a confirm dialog.
   */
  type ReadOnly = {
    /** Human-readable amount to transfer (for example, `"1.5"`). */
    amount: string
    /**
     * Skip the editable wallet UI. The wallet still shows a confirm
     * dialog when no matching access key is available.
     * @default false
     */
    editable?: false | undefined
    /**
     * Address to transfer tokens from. Defaults to the active account. When
     * set to a different address, the call uses `transferFrom` and requires
     * the active account to have an allowance from `from`.
     */
    from?: Address | undefined
    /**
     * UTF-8 memo (max 32 bytes) to attach to the transfer.
     */
    memo?: string | undefined
    /** Recipient address. */
    to: Address
    /**
     * Token to transfer, accepted as either a contract address or a curated
     * tokenlist symbol (case-insensitive, for example `"pathUsd"`). Symbols
     * are resolved against the curated tokenlist on the active chain.
     */
    token: Address | string
  }

  /** Editable variant — opens the wallet send UI with optional pre-filled fields. */
  type Editable = {
    /** Human-readable amount to pre-fill (for example, `"1.5"`). */
    amount?: string | undefined
    /** Show the wallet UI for the user to confirm or edit. */
    editable: true
    /**
     * UTF-8 memo (max 32 bytes) to attach to the transfer.
     */
    memo?: string | undefined
    /** Recipient address to pre-fill. */
    to?: Address | undefined
    /**
     * Token to pre-fill, accepted as either a contract address or a curated
     * tokenlist symbol (case-insensitive, for example `"pathUsd"`). Symbols
     * are resolved against the curated tokenlist on the active chain. Omit
     * to let the user choose.
     */
    token?: Address | string | undefined
  }

  export type Parameters = {
    /** Chain id. Defaults to the active chain. */
    chainId?: number | undefined
    /**
     * Fee payer override. `false` to disable the wallet's default fee payer,
     * a URL string to use a custom fee payer service.
     */
    feePayer?: boolean | string | undefined
  } & OneOf<ReadOnly | Editable>

  export type ReturnValue = {
    /** Chain ID the transfer was submitted to. */
    chainId: number
    /** Receipt of the submitted transfer. */
    receipt: TransactionReceipt
  }

  export type ErrorType = RequestErrorType | CoreErrorType
}

/**
 * Opens the wallet swap flow with optional pre-filled swap fields.
 *
 * @example
 * ```ts
 * import { createClient, custom } from 'viem'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   transport: custom(window.ethereum),
 * })
 *
 * const { receipt } = await Actions.wallet.swap(client, {
 *   amount: '1.5',
 *   token: '0x...',
 *   type: 'sell',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The submitted swap receipt.
 */
export async function swap<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: swap.Parameters = {},
): Promise<swap.ReturnValue> {
  return client.request<{
    Method: 'wallet_swap'
    Parameters: [swap.Parameters]
    ReturnType: swap.ReturnValue
  }>(
    {
      method: 'wallet_swap',
      params: [parameters],
    },
    { retryCount: 0 },
  )
}

export declare namespace swap {
  export type Parameters = {
    /** Human-readable amount to pre-fill (for example, "1.5"). */
    amount?: string | undefined
    /**
     * Other side of the swap pair. For buys, this is the token to sell.
     * For sells, this is the token to buy.
     */
    pairToken?: Address | undefined
    /** Maximum allowed slippage as a decimal fraction, for example `0.05`. */
    slippage?: number | undefined
    /** Token to buy or sell. Omit to let the user choose. */
    token?: Address | undefined
    /** Whether the amount is an exact buy or sell amount. */
    type?: 'buy' | 'sell' | undefined
  }

  export type ReturnValue = {
    /** Receipt of the submitted swap. */
    receipt: TransactionReceipt
  }

  export type ErrorType = RequestErrorType | CoreErrorType
}

/**
 * Opens the wallet deposit flow with optional pre-filled deposit fields.
 *
 * @example
 * ```ts
 * import { createClient, custom } from 'viem'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   transport: custom(window.ethereum),
 * })
 *
 * const result = await Actions.wallet.deposit(client, {
 *   token: '0x...',
 *   value: '1.5',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns Receipts for onchain deposit operations, when applicable.
 */
export async function deposit<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: deposit.Parameters = {},
): Promise<deposit.ReturnValue> {
  return client.request<{
    Method: 'wallet_deposit'
    Parameters: [deposit.Parameters]
    ReturnType: deposit.ReturnValue
  }>(
    {
      method: 'wallet_deposit',
      params: [parameters],
    },
    { retryCount: 0 },
  )
}

export declare namespace deposit {
  export type Parameters = {
    /** Deposit address to pre-fill. */
    address?: Address | undefined
    /** Source chain ID to pre-fill. */
    chainId?: number | undefined
    /** Human-readable account display name. */
    displayName?: string | undefined
    /** Token contract address to pre-fill. Omit to let the user choose. */
    token?: Address | undefined
    /** Human-readable amount to pre-fill (for example, "1.5"). */
    value?: string | undefined
  }

  export type ReturnValue =
    | {
        /** Receipts of any onchain operations performed during the deposit. */
        receipts?: readonly TransactionReceipt[] | undefined
      }
    | undefined

  export type ErrorType = RequestErrorType | CoreErrorType
}
