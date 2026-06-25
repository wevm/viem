import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import type { Hash } from '../../../types/misc.js'
import {
  type GetTransactionReceipt8130ReturnType,
  getTransactionReceipt8130,
} from './getTransactionReceipt8130.js'

export type WaitForTransactionReceipt8130Parameters = {
  /** Transaction hash to wait for. */
  hash: Hash
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

  while (Date.now() < deadline) {
    const receipt = await getTransactionReceipt8130(client, { hash })
    if (receipt !== null) return receipt
    await new Promise<void>((resolve) => setTimeout(resolve, pollingInterval))
  }

  throw new Error(
    `waitForTransactionReceipt8130: timed out after ${timeout}ms waiting for ${hash}`,
  )
}
