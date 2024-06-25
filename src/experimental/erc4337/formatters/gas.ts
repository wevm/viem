import type { ErrorType } from '../../../errors/utils.js'
import type { RpcEstimateUserOperationGasReturnType } from '../types/rpc.js'
import type { EstimateUserOperationGasReturnType } from '../types/userOperation.js'

export type FormatUserOperationGasErrorType = ErrorType

export function formatUserOperationGas(
  parameters: RpcEstimateUserOperationGasReturnType,
): EstimateUserOperationGasReturnType {
  const {
    callGasLimit,
    preVerificationGas,
    verificationGasLimit,
    paymasterPostOpGasLimit,
    paymasterVerificationGasLimit,
  } = parameters
  return {
    callGasLimit: BigInt(callGasLimit),
    preVerificationGas: BigInt(preVerificationGas),
    verificationGasLimit: BigInt(verificationGasLimit),
    paymasterPostOpGasLimit: paymasterPostOpGasLimit
      ? BigInt(paymasterPostOpGasLimit)
      : undefined,
    paymasterVerificationGasLimit: paymasterVerificationGasLimit
      ? BigInt(paymasterVerificationGasLimit)
      : undefined,
  }
}
