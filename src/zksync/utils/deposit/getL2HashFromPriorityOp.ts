import type { Address } from 'abitype'
import type { Hash } from '../../../types/misc.js'
import type { TransactionReceipt } from '../../../types/transaction.js'
import { isAddressEqualLite } from '../../../utils/address/isAddressEqualLite.js'
import { parseEventLogs } from '../../../utils/index.js'
import { zksyncMainAbi } from '../../constants/abis.js'

export type GetL2HashFromPriorityOpParameters = {
  l1TransactionReceipt: TransactionReceipt
  zksyncMainContractAddress: Address
}

export type GetL2HashFromPriorityOpReturnType = Hash

export async function getL2HashFromPriorityOp(
  parameters: GetL2HashFromPriorityOpParameters,
): Promise<GetL2HashFromPriorityOpReturnType> {
  let txHash: Hash | null = null

  for (const log of parameters.l1TransactionReceipt.logs) {
    if (isAddressEqualLite(log.address, parameters.zksyncMainContractAddress)) {
      try {
        const logParsed = parseEventLogs({
          abi: zksyncMainAbi,
          logs: parameters.l1TransactionReceipt.logs,
        })

        const logElement = logParsed[0]

        if (logElement && (logElement as any).args.txHash !== null) {
          txHash = (logElement as any).args.txHash
          break // Exit the loop early if txHash is found
        }
      } catch {
        // Skip
      }
    }
  }

  if (!txHash) {
    throw new Error('Failed to parse tx logs')
  }

  return txHash
}
