import type { ErrorType } from '../../../errors/utils.js'
import { formatLog } from '../../../utils/formatters/log.js'
import { formatTransactionReceipt } from '../../../utils/formatters/transactionReceipt.js'
import type { RpcUserOperationReceipt } from '../../types/rpc.js'
import type { UserOperationReceipt } from '../../types/userOperation.js'

export type FormatUserOperationReceiptErrorType = ErrorType

export function formatUserOperationReceipt(
  parameters: RpcUserOperationReceipt,
) {
  const receipt = { ...parameters } as unknown as UserOperationReceipt

  if (parameters.actualGasCost)
    receipt.actualGasCost = BigInt(parameters.actualGasCost)
  if (parameters.actualGasUsed)
    receipt.actualGasUsed = BigInt(parameters.actualGasUsed)
  if (parameters.logs)
    receipt.logs = parameters.logs.map((log) => formatLog(log)) as any
  if (parameters.receipt)
    receipt.receipt = formatTransactionReceipt(receipt.receipt as any)

  return receipt
}
