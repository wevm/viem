import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import type { Hash, Hex } from '../../../types/misc.js'
import { TransactionExpiredError } from '../errors.js'
import { getTransaction } from './getTransaction.js'
import {
  type GetTransactionReceiptReturnType,
  getTransactionReceipt,
} from './getTransactionReceipt.js'

export type WaitForTransactionReceiptParameters = {
  /** Transaction hash to wait for. */
  hash: Hash
  /**
   * `validBefore` (unix **milliseconds**) of the transaction being awaited. When
   * provided, the wait fails fast with a {@link TransactionExpiredError} once the
   * chain's latest block timestamp passes it. This is the reliable path: it is
   * the value the transaction was signed with (thread it out of `sendCalls` via
   * `onTransaction`, or read it off `prepareTransaction`'s result).
   *
   * If omitted, the wait *opportunistically* tries to read `validBefore` off the
   * still-pending transaction — but nodes are not obligated to return a pending
   * transaction from `eth_getTransactionByHash`, so pass `validBefore` when you
   * need a guarantee. Applies to any expiring transaction (sequenced or
   * nonce-free).
   */
  validBefore?: bigint | number | undefined
  /**
   * How often to poll for the receipt (ms).
   * @default 500
   */
  pollingInterval?: number | undefined
  /**
   * Maximum time to wait before rejecting (ms).
   * @default 60_000
   */
  timeout?: number | undefined
}

export type WaitForTransactionReceiptReturnType =
  NonNullable<GetTransactionReceiptReturnType>

/**
 * Polls `eth_getTransactionReceipt` until an EIP-8130 (`AA_TX_TYPE`) transaction
 * is included in a block, then returns the receipt with the EIP-8130 fields
 * (`payer`, `phaseStatuses`, `metadata`) attached.
 *
 * Unlike the generic `waitForTransactionReceipt`, this action:
 * - Uses `getTransactionReceipt` so EIP-8130 receipt fields are surfaced.
 * - Skips the standard replacement-detection path (EIP-8130 uses 2D nonces and
 *   cannot be replaced via the same-nonce mechanism).
 * - Detects expiring transactions that can no longer land: once the chain's
 *   latest block timestamp passes the tx's `validBefore`, it rejects with a
 *   {@link TransactionExpiredError} instead of silently waiting for the timeout.
 *   Any transaction with a non-zero `validBefore` expires — sequenced and
 *   nonce-free alike — so pass `validBefore` (the value you signed) for reliable
 *   detection. When omitted, it is read opportunistically off the pending tx,
 *   which is best-effort only: a node may not serve a pending
 *   `eth_getTransactionByHash`.
 *
 * @example
 * const receipt = await waitForTransactionReceipt(client, {
 *   hash: '0xabc...',
 * })
 * console.log(receipt.eip8130.phaseStatuses) // ['0x1']
 */
export async function waitForTransactionReceipt<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: WaitForTransactionReceiptParameters,
): Promise<WaitForTransactionReceiptReturnType> {
  const { hash, pollingInterval = 500, timeout = 60_000 } = parameters

  const deadline = Date.now() + timeout

  // The reliable bound is the caller-supplied one (the value the tx was signed
  // with). `validBefore === 0` means "no upper bound", so treat it as unknown.
  const suppliedValidBefore =
    parameters.validBefore !== undefined && BigInt(parameters.validBefore) > 0n
  let validBefore = suppliedValidBefore
    ? BigInt(parameters.validBefore!)
    : undefined

  while (Date.now() < deadline) {
    const receipt = await getTransactionReceipt(client, { hash })
    if (receipt !== null) return receipt

    // Opportunistic fallback only: if the caller didn't supply `validBefore`,
    // try to read it off the still-pending tx. This is best-effort — a node is
    // not obligated to serve a pending `eth_getTransactionByHash`, so it may
    // never resolve. Applies to any expiring tx (sequenced or nonce-free).
    if (validBefore === undefined) {
      try {
        const tx = await getTransaction(client, { hash })
        if (tx.validBefore > 0) validBefore = BigInt(tx.validBefore)
      } catch {}
    }

    if (validBefore !== undefined) {
      const blockTimestamp = await getLatestBlockTimestamp(client)
      // `validBefore` is unix milliseconds; block timestamps are unix seconds.
      if (blockTimestamp !== undefined && blockTimestamp * 1000n > validBefore)
        throw new TransactionExpiredError({
          hash,
          validBefore,
          blockTimestamp,
        })
    }

    await new Promise<void>((resolve) => setTimeout(resolve, pollingInterval))
  }

  throw new Error(
    `waitForTransactionReceipt: timed out after ${timeout}ms waiting for ${hash}`,
  )
}

async function getLatestBlockTimestamp(
  client: Client<Transport, any, any>,
): Promise<bigint | undefined> {
  try {
    const block = await (
      client.request as (args: {
        method: 'eth_getBlockByNumber'
        params: ['latest', false]
      }) => Promise<{ timestamp: Hex } | null>
    )({ method: 'eth_getBlockByNumber', params: ['latest', false] })
    return block?.timestamp ? BigInt(block.timestamp) : undefined
  } catch {
    return undefined
  }
}
