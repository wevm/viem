import type { Address } from 'abitype'

import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import type { Hash, Hex } from '../../../types/misc.js'

/**
 * EIP-8130 receipt fields surfaced by `eth_getTransactionReceipt`
 * (base `feat(eip8130): RPC support for ... AA receipts`).
 *
 * These are present only for `AA_TX_TYPE` (`0x79`) receipts on a node with the
 * extension; they are `undefined` for standard receipts or older nodes.
 */
export type ReceiptFields = {
  /**
   * Gas payer: the sender for self-pay, or the named payer for a sponsored tx.
   */
  payer?: Address | undefined
  /**
   * Per-phase execution status (`0x1` success / `0x0` revert), in phase order.
   * Phases after a revert are reported `0x0`. Empty when `calls` is empty.
   */
  phaseStatuses?: readonly Hex[] | undefined
  /** Opaque EIP-8130 transaction metadata, echoed from the signed tx. */
  metadata?: Hex | undefined
}

/** Raw JSON-RPC receipt with optional EIP-8130 fields (hex-encoded). */
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

/** Returns `true` when every reported call phase succeeded. */
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
