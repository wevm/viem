import type { Address } from 'abitype'
import type { Hash } from '../../../types/misc.js'
import type { TransactionReceipt } from '../../../types/transaction.js'
import { decodeEventLog, isAddressEqual } from '../../../utils/index.js'
import { zksyncAbi } from '../../constants/abis.js'
import {
  TxHashNotFoundInLogsError,
  type TxHashNotFoundInLogsErrorType,
} from '../../errors/bridge.js'

export type GetL2HashFromPriorityOpErrorType = TxHashNotFoundInLogsErrorType

/**
 * Returns the hash of the L2 priority operation from a given L1 transaction receipt.
 *
 * @param receipt - The L1 transaction receipt.
 * @param zksync - The address of the ZKsync Era main contract.
 * @returns hash - The hash of the L2 priority operation.
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { zksync, mainnet } from 'viem/chains'
 * import { publicActionsL2, getL2HashFromPriorityOp } from 'viem/zksync'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const zksyncClient = const client = createPublicClient({
 *   chain: zksync,
 *   transport: http(),
 * })
 *
 * const receipt = await client.waitForTransactionReceipt({hash: '0x...'})
 * const l2Hash = getL2HashFromPriorityOp(
 *   receipt,
 *   await zksyncClient.getMainContractAddress()
 * )
 */
export function getL2HashFromPriorityOp(
  receipt: TransactionReceipt,
  zksync: Address,
): Address {
  let hash: Hash | null = null
  for (const log of receipt.logs) {
    if (!isAddressEqual(log.address, zksync)) continue
    try {
      const priorityQueueLog = decodeEventLog({
        abi: zksyncAbi,
        data: log.data,
        topics: log.topics,
      })
      if (priorityQueueLog && (priorityQueueLog.args as any).txHash !== null)
        hash = (priorityQueueLog.args as any).txHash
    } catch (_e) {}
  }

  if (!hash) {
    throw new TxHashNotFoundInLogsError()
  }
  return hash
}
