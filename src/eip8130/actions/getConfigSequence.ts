import type { Address } from 'abitype'
import { readContract } from '../../actions/public/readContract.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import { keystoreAbi } from '../abis.js'
import { keystoreAddress, unsequencedLocalHalf } from '../constants.js'

export type GetConfigSequenceParameters = {
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
 * `Keystore` system contract. Use the returned `local` value as
 * the `sequence` parameter when building an `AccountChange` — it is the NEXT
 * expected sequence, not the last one used.
 *
 * Calling this before signing any owner change (authorize / revoke) prevents
 * sequence-mismatch rejections caused by a stale local cache.
 *
 * For an *unsequenced* (JIT) local change, don't use `local` — build the word
 * from `localEpoch` via {@link unsequencedLocalSequence} instead.
 *
 * @example
 * const { local } = await getConfigSequence(client, { account: accountAddress })
 * // Use `local` as the sequence for the next AccountChange.
 */
export async function getConfigSequence<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: GetConfigSequenceParameters,
): Promise<GetConfigSequenceReturnType> {
  const { account } = parameters

  const result = await readContract(client, {
    address: keystoreAddress,
    abi: keystoreAbi,
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

/**
 * Builds an *unsequenced* (JIT) `'local'` channel sequence word from the current
 * `localEpoch`: `localEpoch (high 32) || UNSEQUENCED (low 32)`, where
 * `UNSEQUENCED` is {@link unsequencedLocalHalf} (`type(uint32).max`).
 *
 * A change signed at this word is bound to the current epoch but not pinned to a
 * monotonic `localSequence`: it may land at any position within the epoch and is
 * invalidated by an `incrementLocalEpoch` bump. Pass it as the `sequence` to
 * `account.change(...)` / `signAccountChanges(...)`.
 *
 * @example
 * import { getConfigSequence, unsequencedLocalSequence } from 'viem/eip8130'
 *
 * const { localEpoch } = await getConfigSequence(client, { account: account.address })
 * const change = await account.change(changes, {
 *   channel: 'local',
 *   chainId: client.chain.id,
 *   sequence: unsequencedLocalSequence(localEpoch),
 * })
 *
 * @param localEpoch - The current local epoch (from {@link getConfigSequence}).
 * @returns The packed `uint64` local sequence word with the unsequenced sentinel.
 */
export function unsequencedLocalSequence(localEpoch: number): bigint {
  return (BigInt(localEpoch) << 32n) | unsequencedLocalHalf
}
