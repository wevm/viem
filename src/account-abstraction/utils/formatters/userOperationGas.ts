import type { ErrorType } from '../../../errors/utils.js'
import type { RpcEstimateUserOperationGasReturnType } from '../../types/rpc.js'
import type { EstimateUserOperationGasReturnType } from '../../types/userOperation.js'

export type FormatUserOperationGasErrorType = ErrorType

export function formatUserOperationGas(
  parameters: RpcEstimateUserOperationGasReturnType,
): EstimateUserOperationGasReturnType {
  const gas = {} as EstimateUserOperationGasReturnType

  if (parameters.callGasLimit)
    gas.callGasLimit = BigInt(parameters.callGasLimit)
  if (parameters.preVerificationGas)
    gas.preVerificationGas = BigInt(parameters.preVerificationGas)
  if (parameters.verificationGasLimit)
    gas.verificationGasLimit = BigInt(parameters.verificationGasLimit)
  if (parameters.paymasterPostOpGasLimit)
    gas.paymasterPostOpGasLimit = BigInt(parameters.paymasterPostOpGasLimit)
  if (parameters.paymasterVerificationGasLimit)
    gas.paymasterVerificationGasLimit = BigInt(
      parameters.paymasterVerificationGasLimit,
    )

  return gas
}
