import type { ErrorType } from '../../errors/utils.js'
import type { FeeHistory } from '../../types/fee.js'
import type { RpcFeeHistory } from '../../types/rpc.js'

export type FormatFeeHistoryErrorType = ErrorType

export function formatFeeHistory(feeHistory: RpcFeeHistory): FeeHistory {
  const { baseFeePerBlobGas, blobGasUsedRatio } = feeHistory
  return {
    ...(baseFeePerBlobGas && {
      baseFeePerBlobGas: baseFeePerBlobGas.map((value) => BigInt(value)),
    }),
    baseFeePerGas: feeHistory.baseFeePerGas.map((value) => BigInt(value)),
    ...(blobGasUsedRatio && { blobGasUsedRatio }),
    gasUsedRatio: feeHistory.gasUsedRatio,
    oldestBlock: BigInt(feeHistory.oldestBlock),
    reward: feeHistory.reward?.map((reward) =>
      reward.map((value) => BigInt(value)),
    ),
  }
}
