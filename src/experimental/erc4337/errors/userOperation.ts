import { BaseError } from '../../../errors/base.js'
import { prettyPrint } from '../../../errors/transaction.js'
import { formatGwei } from '../../../utils/index.js'
import type { UserOperation } from '../types/userOperation.js'

export type UserOperationExecutionErrorType = UserOperationExecutionError & {
  name: 'UserOperationExecutionError'
}
export class UserOperationExecutionError extends BaseError {
  override cause: BaseError

  override name = 'UserOperationExecutionError'

  constructor(
    cause: BaseError,
    {
      callData,
      callGasLimit,
      docsPath,
      factory,
      factoryData,
      initCode,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      paymaster,
      paymasterAndData,
      paymasterData,
      paymasterPostOpGasLimit,
      paymasterVerificationGasLimit,
      preVerificationGas,
      sender,
      signature,
      verificationGasLimit,
    }: UserOperation & {
      docsPath?: string | undefined
    },
  ) {
    const prettyArgs = prettyPrint({
      callData,
      callGasLimit,
      factory,
      factoryData,
      initCode,
      maxFeePerGas:
        typeof maxFeePerGas !== 'undefined' &&
        `${formatGwei(maxFeePerGas)} gwei`,
      maxPriorityFeePerGas:
        typeof maxPriorityFeePerGas !== 'undefined' &&
        `${formatGwei(maxPriorityFeePerGas)} gwei`,
      nonce,
      paymaster,
      paymasterAndData,
      paymasterData,
      paymasterPostOpGasLimit,
      paymasterVerificationGasLimit,
      preVerificationGas,
      sender,
      signature,
      verificationGasLimit,
    })

    super(cause.shortMessage, {
      cause,
      docsPath,
      metaMessages: [
        ...(cause.metaMessages ? [...cause.metaMessages, ' '] : []),
        'Request Arguments:',
        prettyArgs,
      ].filter(Boolean) as string[],
    })
    this.cause = cause
  }
}
