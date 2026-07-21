import type { Address } from 'abitype'
import type { Hash } from '../../types/misc.js'
import { concatHex } from '../../utils/data/concat.js'
import { keccak256 } from '../../utils/hash/keccak256.js'

export type GetWithdrawalSenderTagParameters = {
  /** Address that requested the withdrawal on the zone. */
  sender: Address
  /** Hash of the zone transaction that requested the withdrawal. */
  transactionHash: Hash
}

export type GetWithdrawalSenderTagReturnType = Hash

/**
 * Computes the authenticated sender tag for a Tempo Zone withdrawal.
 *
 * @example
 * ```ts
 * import { getWithdrawalSenderTag } from 'viem/tempo/zones'
 *
 * const senderTag = getWithdrawalSenderTag({
 *   sender: '0x0000000000000000000000000000000000000001',
 *   transactionHash: '0x2222222222222222222222222222222222222222222222222222222222222222',
 * })
 * ```
 *
 * @param parameters - Withdrawal sender and zone transaction hash.
 * @returns The withdrawal sender tag.
 */
export function getWithdrawalSenderTag({
  sender,
  transactionHash,
}: GetWithdrawalSenderTagParameters): GetWithdrawalSenderTagReturnType {
  return keccak256(concatHex([sender, transactionHash]))
}
