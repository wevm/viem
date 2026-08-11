import type { Address } from 'abitype'
import { readContract } from '../../actions/public/readContract.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import { accountConfigurationAbi } from '../abis.js'

export type GetConfigSequenceParameters = {
  /** The EIP-8130 AccountConfiguration system contract address. */
  accountConfiguration: Address
  /** The account whose local config sequence to read. */
  account: Address
}

export type GetConfigSequenceReturnType = {
  /**
   * The NEXT local-channel `sequence` word to sign: `localEpoch (high 32) ||
   * localSequence (low 32)`. Pass it directly as the `sequence` for a `'local'`
   * channel `SignedAccountChanges` batch.
   */
  local: bigint
  /**
   * The multi-chain change sequence (cross-chain changes via EIP-8130
   * multi-chain signing). The NEXT `sequence` for a `'multichain'` batch.
   */
  multichain: bigint
  /** The current local epoch (high 32 bits of the local word). */
  localEpoch: number
  /** The current local sequence (low 32 bits of the local word). */
  localSequence: number
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
 * const { local } = await getConfigSequence(client, {
 *   accountConfiguration: deployment.accountConfiguration,
 *   account: accountAddress,
 * })
 * // Use `local` as the sequence for the next AccountChange.
 */
export async function getConfigSequence<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: GetConfigSequenceParameters,
): Promise<GetConfigSequenceReturnType> {
  const { accountConfiguration, account } = parameters

  const result = await readContract(client, {
    address: accountConfiguration,
    abi: accountConfigurationAbi,
    functionName: 'getChangeSequences',
    args: [account],
  })

  // The signed local `sequence` word is `localEpoch (high 32) || localSequence
  // (low 32)`; recompose it so callers can pass `local` straight through.
  const local =
    (BigInt(result.localEpoch) << 32n) | BigInt(result.localSequence)
  return {
    local,
    multichain: result.multichain,
    localEpoch: result.localEpoch,
    localSequence: result.localSequence,
  }
}
