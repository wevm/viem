import { BaseError } from '../../errors/base.js'
import { prettyPrint } from '../../errors/transaction.js'
import type { Hash } from '../../types/misc.js'
import { formatGwei } from '../../utils/index.js'
import type { UserOperation } from '../types/userOperation.js'

export type UserOperationExecutionErrorType = UserOperationExecutionError & {
  name: 'UserOperationExecutionError'
}
export class UserOperationExecutionError extends BaseError {
  override cause: BaseError

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
      name: 'UserOperationExecutionError',
    })
    this.cause = cause
  }
}

export type UserOperationReceiptNotFoundErrorType =
  UserOperationReceiptNotFoundError & {
    name: 'UserOperationReceiptNotFoundError'
  }
export class UserOperationReceiptNotFoundError extends BaseError {
  constructor({ hash }: { hash: Hash }) {
    super(
      `User Operation receipt with hash "${hash}" could not be found. The User Operation may not have been processed yet.`,
      { name: 'UserOperationReceiptNotFoundError' },
    )
  }
}

export type UserOperationNotFoundErrorType = UserOperationNotFoundError & {
  name: 'UserOperationNotFoundError'
}
export class UserOperationNotFoundError extends BaseError {
  constructor({ hash }: { hash: Hash }) {
    super(`User Operation with hash "${hash}" could not be found.`, {
      name: 'UserOperationNotFoundError',
    })
  }
}

export type WaitForUserOperationReceiptTimeoutErrorType =
  WaitForUserOperationReceiptTimeoutError & {
    name: 'WaitForUserOperationReceiptTimeoutError'
  }
export class WaitForUserOperationReceiptTimeoutError extends BaseError {
  constructor({ hash }: { hash: Hash }) {
    super(
      `Timed out while waiting for User Operation with hash "${hash}" to be confirmed.`,
      { name: 'WaitForUserOperationReceiptTimeoutError' },
    )
  }
}
