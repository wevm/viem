import type { ErrorType } from '../../../errors/utils.js'
import type { RpcUserOperation } from '../../types/rpc.js'
import type { UserOperation } from '../../types/userOperation.js'

export type FormatUserOperationErrorType = ErrorType

export function formatUserOperation(parameters: RpcUserOperation) {
  const { eip7702Auth, ...rest } = parameters
  const userOperation = rest as unknown as UserOperation

  if (eip7702Auth)
    userOperation.authorization = {
      address: eip7702Auth.address,
      chainId: Number(eip7702Auth.chainId),
      nonce: Number(eip7702Auth.nonce),
      r: eip7702Auth.r,
      s: eip7702Auth.s,
      yParity: Number(eip7702Auth.yParity),
    }

  if (parameters.callGasLimit)
    userOperation.callGasLimit = BigInt(parameters.callGasLimit)
  if (parameters.maxFeePerGas)
    userOperation.maxFeePerGas = BigInt(parameters.maxFeePerGas)
  if (parameters.maxPriorityFeePerGas)
    userOperation.maxPriorityFeePerGas = BigInt(parameters.maxPriorityFeePerGas)
  if (parameters.nonce) userOperation.nonce = BigInt(parameters.nonce)
  if (parameters.paymasterPostOpGasLimit)
    userOperation.paymasterPostOpGasLimit = BigInt(
      parameters.paymasterPostOpGasLimit,
    )
  if (parameters.paymasterVerificationGasLimit)
    userOperation.paymasterVerificationGasLimit = BigInt(
      parameters.paymasterVerificationGasLimit,
    )
  if (parameters.preVerificationGas)
    userOperation.preVerificationGas = BigInt(parameters.preVerificationGas)
  if (parameters.verificationGasLimit)
    userOperation.verificationGasLimit = BigInt(parameters.verificationGasLimit)

  return userOperation
}
