import type { Address } from 'abitype'

import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import { readContract } from '../../../actions/public/readContract.js'
import { accountConfigurationAbi } from '../abis.js'

export type GetConfigSequence8130Parameters = {
  /** The EIP-8130 AccountConfiguration system contract address. */
  accountConfiguration: Address
  /** The account whose local config sequence to read. */
  account: Address
}

export type GetConfigSequence8130ReturnType = {
  /**
   * The local (single-chain) change sequence. This is the NEXT sequence
   * number to use when signing an `ActorChange` — it equals the count of
   * config changes that have been applied to the account on this chain.
   */
  local: bigint
  /**
   * The multi-chain change sequence (cross-chain actor changes via EIP-8130
   * multi-chain signing).
   */
  multichain: bigint
}

/**
 * Reads the current config-change sequences for an EIP-8130 account from the
 * `AccountConfiguration` system contract. Use the returned `local` value as
 * the `sequence` parameter when building an `AccountChange` — it is the NEXT
 * expected sequence, not the last one used.
 *
 * Calling this before signing any owner change (authorize / revoke) prevents
 * sequence-mismatch rejections caused by a stale local cache.
 *
 * @example
 * const { local } = await getConfigSequence8130(client, {
 *   accountConfiguration: deployment.accountConfiguration,
 *   account: accountAddress,
 * })
 * // Use `local` as the sequence for the next AccountChange.
 */
export async function getConfigSequence8130<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: GetConfigSequence8130Parameters,
): Promise<GetConfigSequence8130ReturnType> {
  const { accountConfiguration, account } = parameters

  const result = await readContract(client, {
    address: accountConfiguration,
    abi: accountConfigurationAbi,
    functionName: 'getChangeSequences',
    args: [account],
  })

  return {
    local: result.local,
    multichain: result.multichain,
  }
}
