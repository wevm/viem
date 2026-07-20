import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import type { Hash, Hex } from '../../../types/misc.js'
import { TransactionExpiredError } from '../errors.js'
import { getTransaction8130 } from './getTransaction8130.js'
import {
  type GetTransactionReceipt8130ReturnType,
  getTransactionReceipt8130,
} from './getTransactionReceipt8130.js'

export type WaitForTransactionReceipt8130Parameters = {
  /** Transaction hash to wait for. */
  hash: Hash
  /**
   * `expiry` (unix seconds) of the transaction being awaited. When provided,
   * the wait fails fast with a {@link TransactionExpiredError} once the chain's
   * latest block timestamp passes it. This is the reliable path: it is the
   * value the transaction was signed with (thread it out of `sendCalls8130` via
   * `onTransaction`, or read it off `prepareTransaction8130`'s result).
   *
   * If omitted, the wait *opportunistically* tries to read the expiry off the
   * still-pending transaction — but nodes are not obligated to return a pending
   * transaction from `eth_getTransactionByHash`, so pass `expiry` when you need
   * a guarantee. Applies to any expiring transaction (sequenced or nonce-free).
   */
  expiry?: bigint | number | undefined
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

export type WaitForTransactionReceipt8130ReturnType = NonNullable<GetTransactionReceipt8130ReturnType>

/**
 * Polls `eth_getTransactionReceipt` until an EIP-8130 (`AA_TX_TYPE`) transaction
 * is included in a block, then returns the receipt with the EIP-8130 fields
 * (`payer`, `phaseStatuses`, `metadata`) attached.
 *
 * Unlike the generic `waitForTransactionReceipt`, this action:
 * - Uses `getTransactionReceipt8130` so EIP-8130 receipt fields are surfaced.
 * - Skips the standard replacement-detection path (EIP-8130 uses 2D nonces and
 *   cannot be replaced via the same-nonce mechanism).
 * - Detects expiring transactions that can no longer land: once the chain's
 *   latest block timestamp passes the tx's `expiry`, it rejects with a
 *   {@link TransactionExpiredError} instead of silently waiting for the timeout.
 *   Any transaction with a non-zero `expiry` expires — sequenced and nonce-free
 *   alike — so pass `expiry` (the value you signed) for reliable detection. When
 *   omitted, the expiry is read opportunistically off the pending tx, which is
 *   best-effort only: a node may not serve a pending `eth_getTransactionByHash`.
 *
 * @example
 * const receipt = await waitForTransactionReceipt8130(client, {
 *   hash: '0xabc...',
 * })
 * console.log(receipt.eip8130.phaseStatuses) // ['0x1']
 */
export async function waitForTransactionReceipt8130<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: WaitForTransactionReceipt8130Parameters,
): Promise<WaitForTransactionReceipt8130ReturnType> {
  const {
    hash,
    pollingInterval = 500,
    timeout = 60_000,
  } = parameters

  const deadline = Date.now() + timeout

  // The reliable expiry is the caller-supplied one (the value the tx was signed
  // with). `expiry === 0` means "no expiry", so treat it as unknown.
  const suppliedExpiry =
    parameters.expiry !== undefined && BigInt(parameters.expiry) > 0n
  let expiry = suppliedExpiry ? BigInt(parameters.expiry!) : undefined

  while (Date.now() < deadline) {
    const receipt = await getTransactionReceipt8130(client, { hash })
    if (receipt !== null) return receipt

    // Opportunistic fallback only: if the caller didn't supply `expiry`, try to
    // read it off the still-pending tx. This is best-effort — a node is not
    // obligated to serve a pending `eth_getTransactionByHash`, so it may never
    // resolve. Applies to any expiring tx (sequenced or nonce-free).
    if (expiry === undefined) {
      try {
        const tx = await getTransaction8130(client, { hash })
        if (tx.expiry > 0) expiry = BigInt(tx.expiry)
      } catch {}
    }

    if (expiry !== undefined) {
      const blockTimestamp = await getLatestBlockTimestamp(client)
      if (blockTimestamp !== undefined && blockTimestamp > expiry)
        throw new TransactionExpiredError({ hash, expiry, blockTimestamp })
    }

    await new Promise<void>((resolve) => setTimeout(resolve, pollingInterval))
  }

  throw new Error(
    `waitForTransactionReceipt8130: timed out after ${timeout}ms waiting for ${hash}`,
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
