import type { Address } from 'abitype'

import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { BlockTag } from '../../../types/block.js'
import type { Chain } from '../../../types/chain.js'
import type { Hex } from '../../../types/misc.js'
import { hexToBigInt } from '../../../utils/encoding/fromHex.js'
import { numberToHex } from '../../../utils/encoding/toHex.js'
import { nonceKeyMax } from '../constants.js'

export type GetTransactionCountParameters = {
  /** The account address. */
  address: Address
  /**
   * EIP-8130 2D nonce channel key. Defaults to `0n` (the protocol nonce, read
   * from account state). A non-zero key returns the channel nonce
   * `nonces[address][nonceKey]` from the Nonce Manager precompile.
   *
   * `nonceKey === NONCE_KEY_MAX` selects the expiring-nonce channel, which has
   * no per-channel counter — the node returns `INVALID_PARAMS` for it.
   */
  nonceKey?: bigint | undefined
  /** The block number. */
  blockNumber?: bigint | undefined
  /** The block tag. Defaults to `'pending'` so freshly-sent txs are counted. */
  blockTag?: BlockTag | undefined
}

export type GetTransactionCountReturnType = bigint

/**
 * Reads an EIP-8130 nonce via `eth_getTransactionCount`, including the 2D
 * channel-nonce extension (base `feat(eip8130): EIP-8130 rpc extensions`).
 *
 * This is the correct way to read an EIP-8130 sequence number for the next
 * transaction. The Nonce Manager precompile is **not** a normal contract — a
 * direct `eth_call` to its `getNonce` reverts — so the value must be read
 * through this RPC extension (the third `nonce_key` parameter), not via
 * `readContract`.
 *
 * - `nonceKey === 0n` → protocol nonce from account state (standard resolution).
 * - `nonceKey !== 0n` → 2D channel nonce from the precompile storage.
 *
 * @example
 * const sequence = await getTransactionCount(client, {
 *   address: account.address,
 *   nonceKey: 0n,
 * })
 */
export async function getTransactionCount<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: GetTransactionCountParameters,
): Promise<GetTransactionCountReturnType> {
  const {
    address,
    nonceKey = 0n,
    blockNumber,
    blockTag = 'pending',
  } = parameters

  if (nonceKey === nonceKeyMax)
    throw new Error(
      'nonceKey NONCE_KEY_MAX selects the expiring-nonce channel, which has no per-channel counter. Use an `expiry` instead of reading a sequence number.',
    )

  const block = blockNumber !== undefined ? numberToHex(blockNumber) : blockTag

  // Third positional `nonce_key` is the EIP-8130 RPC extension. Omitting it
  // (or passing 0x0) yields the standard protocol-nonce resolution.
  const params: [Address, string] | [Address, string, Hex] =
    nonceKey === 0n ? [address, block] : [address, block, numberToHex(nonceKey)]

  const count = await (
    client.request as (args: {
      method: 'eth_getTransactionCount'
      params: [Address, string] | [Address, string, Hex]
    }) => Promise<Hex>
  )({ method: 'eth_getTransactionCount', params })

  return hexToBigInt(count)
}
