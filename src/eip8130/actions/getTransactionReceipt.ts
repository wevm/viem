import type { Address } from 'abitype'

import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { Hash, Hex } from '../../types/misc.js'

/**
 * AA receipt fields surfaced by `eth_getTransactionReceipt`.
 *
 * The receipt payload itself is a standard EIP-1559 receipt: `status` is `1`
 * only if every call phase succeeded (or `calls` was empty). `status == 0`
 * does not mean nothing happened: committed earlier phases, applied account
 * changes, nonce consumption, and fee payment persist.
 *
 * These fields are present only for `AA_TX_TYPE` (`0x79`) receipts on a node
 * with the extension; they are `undefined` for standard receipts or older nodes.
 */
export type ReceiptFields = {
  /**
   * Resolved gas payer: the sender for self-pay, the named payer, or the payer
   * recovered in open mode.
   */
  payer?: Address | undefined
  /**
   * Per-phase execution status (`0x1` success / `0x0` revert), in phase order.
   * Phases after a revert are reported `0x0`. Empty when `calls` is empty.
   */
  phaseStatuses?: readonly Hex[] | undefined
  /** Opaque transaction metadata, echoed from the signed tx. */
  metadata?: Hex | undefined
}

/** Raw JSON-RPC receipt with optional AA fields (hex-encoded). */
type RawReceipt = {
  status?: Hex
  payer?: Address
  phaseStatuses?: readonly Hex[]
  metadata?: Hex
  [key: string]: unknown
}

export type GetTransactionReceiptParameters = {
  /** Transaction hash to fetch the receipt for. */
  hash: Hash
}

export type GetTransactionReceiptReturnType =
  | (RawReceipt & {
      /** Parsed EIP-8130 receipt fields (decoded from the raw receipt). */
      eip8130: ReceiptFields
    })
  | null

/** Reads the EIP-8130 fields off a raw JSON-RPC receipt (graceful if absent). */
export function parseReceiptFields(
  receipt: RawReceipt | null | undefined,
): ReceiptFields {
  if (!receipt) return {}
  return {
    payer: receipt.payer,
    phaseStatuses: receipt.phaseStatuses,
    metadata: receipt.metadata,
  }
}

/**
 * Returns `true` when every reported call phase succeeded. Equivalent to
 * `receipt.status === 'success'` for AA receipts.
 */
export function allPhasesSucceeded(
  fields: Pick<ReceiptFields, 'phaseStatuses'>,
): boolean {
  const phases = fields.phaseStatuses
  if (!phases) return true
  return phases.every((s) => s === '0x1' || s === '0x01')
}

/**
 * Fetches a transaction receipt and surfaces the EIP-8130 AA fields (`payer`,
 * `phaseStatuses`, `metadata`) alongside the raw receipt. Returns `null` when
 * the receipt is not yet available.
 */
export async function getTransactionReceipt<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: GetTransactionReceiptParameters,
): Promise<GetTransactionReceiptReturnType> {
  const { hash } = parameters
  const receipt = await (
    client.request as (args: {
      method: 'eth_getTransactionReceipt'
      params: [Hash]
    }) => Promise<RawReceipt | null>
  )({ method: 'eth_getTransactionReceipt', params: [hash] })

  if (!receipt) return null
  return { ...receipt, eip8130: parseReceiptFields(receipt) }
}
