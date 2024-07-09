import type { Hash } from '../types/misc.js'
import type { UserOperation } from '../types/userOperation.js'
import { formatGwei } from '../utils/index.js'
import { BaseError } from './base.js'
import { prettyPrint } from './transaction.js'

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

export type UserOperationReceiptNotFoundErrorType =
  UserOperationReceiptNotFoundError & {
    name: 'UserOperationReceiptNotFoundError'
  }
export class UserOperationReceiptNotFoundError extends BaseError {
  override name = 'UserOperationReceiptNotFoundError'
  constructor({ hash }: { hash: Hash }) {
    super(
      `User Operation receipt with hash "${hash}" could not be found. The User Operation may not have been processed yet.`,
    )
  }
}

export type UserOperationNotFoundErrorType = UserOperationNotFoundError & {
  name: 'UserOperationNotFoundError'
}
export class UserOperationNotFoundError extends BaseError {
  override name = 'UserOperationNotFoundError'
  constructor({ hash }: { hash: Hash }) {
    super(`User Operation with hash "${hash}" could not be found.`)
  }
}

export type WaitForUserOperationReceiptTimeoutErrorType =
  WaitForUserOperationReceiptTimeoutError & {
    name: 'WaitForUserOperationReceiptTimeoutError'
  }
export class WaitForUserOperationReceiptTimeoutError extends BaseError {
  override name = 'WaitForUserOperationReceiptTimeoutError'
  constructor({ hash }: { hash: Hash }) {
    super(
      `Timed out while waiting for User Operation with hash "${hash}" to be confirmed.`,
    )
  }
}
