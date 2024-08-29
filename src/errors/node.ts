import { formatGwei } from '../utils/unit/formatGwei.js'

import { BaseError } from './base.js'

/**
 * geth:    https://github.com/ethereum/go-ethereum/blob/master/core/error.go
 *          https://github.com/ethereum/go-ethereum/blob/master/core/types/transaction.go#L34-L41
 *
 * erigon:  https://github.com/ledgerwatch/erigon/blob/master/core/error.go
 *          https://github.com/ledgerwatch/erigon/blob/master/core/types/transaction.go#L41-L46
 *
 * anvil:   https://github.com/foundry-rs/foundry/blob/master/anvil/src/eth/error.rs#L108
 */
export type ExecutionRevertedErrorType = ExecutionRevertedError & {
  code: 3
  name: 'ExecutionRevertedError'
}
export class ExecutionRevertedError extends BaseError {
  static code = 3
  static nodeMessage = /execution reverted/

  constructor({
    cause,
    message,
  }: { cause?: BaseError | undefined; message?: string | undefined } = {}) {
    const reason = message
      ?.replace('execution reverted: ', '')
      ?.replace('execution reverted', '')
    super(
      `Execution reverted ${
        reason ? `with reason: ${reason}` : 'for an unknown reason'
      }.`,
      {
        cause,
        name: 'ExecutionRevertedError',
      },
    )
  }
}

export type FeeCapTooHighErrorType = FeeCapTooHighError & {
  name: 'FeeCapTooHighError'
}
export class FeeCapTooHighError extends BaseError {
  static nodeMessage =
    /max fee per gas higher than 2\^256-1|fee cap higher than 2\^256-1/
  constructor({
    cause,
    maxFeePerGas,
  }: {
    cause?: BaseError | undefined
    maxFeePerGas?: bigint | undefined
  } = {}) {
    super(
      `The fee cap (\`maxFeePerGas\`${
        maxFeePerGas ? ` = ${formatGwei(maxFeePerGas)} gwei` : ''
      }) cannot be higher than the maximum allowed value (2^256-1).`,
      {
        cause,
        name: 'FeeCapTooHighError',
      },
    )
  }
}

export type FeeCapTooLowErrorType = FeeCapTooLowError & {
  name: 'FeeCapTooLowError'
}
export class FeeCapTooLowError extends BaseError {
  static nodeMessage =
    /max fee per gas less than block base fee|fee cap less than block base fee|transaction is outdated/
  constructor({
    cause,
    maxFeePerGas,
  }: {
    cause?: BaseError | undefined
    maxFeePerGas?: bigint | undefined
  } = {}) {
    super(
      `The fee cap (\`maxFeePerGas\`${
        maxFeePerGas ? ` = ${formatGwei(maxFeePerGas)}` : ''
      } gwei) cannot be lower than the block base fee.`,
      {
        cause,
        name: 'FeeCapTooLowError',
      },
    )
  }
}

export type NonceTooHighErrorType = NonceTooHighError & {
  name: 'NonceTooHighError'
}
export class NonceTooHighError extends BaseError {
  static nodeMessage = /nonce too high/
  constructor({
    cause,
    nonce,
  }: { cause?: BaseError | undefined; nonce?: number | undefined } = {}) {
    super(
      `Nonce provided for the transaction ${
        nonce ? `(${nonce}) ` : ''
      }is higher than the next one expected.`,
      { cause, name: 'NonceTooHighError' },
    )
  }
}

export type NonceTooLowErrorType = NonceTooLowError & {
  name: 'NonceTooLowError'
}
export class NonceTooLowError extends BaseError {
  static nodeMessage =
    /nonce too low|transaction already imported|already known/
  constructor({
    cause,
    nonce,
  }: { cause?: BaseError | undefined; nonce?: number | undefined } = {}) {
    super(
      [
        `Nonce provided for the transaction ${
          nonce ? `(${nonce}) ` : ''
        }is lower than the current nonce of the account.`,
        'Try increasing the nonce or find the latest nonce with `getTransactionCount`.',
      ].join('\n'),
      { cause, name: 'NonceTooLowError' },
    )
  }
}

export type NonceMaxValueErrorType = NonceMaxValueError & {
  name: 'NonceMaxValueError'
}
export class NonceMaxValueError extends BaseError {
  static nodeMessage = /nonce has max value/
  constructor({
    cause,
    nonce,
  }: { cause?: BaseError | undefined; nonce?: number | undefined } = {}) {
    super(
      `Nonce provided for the transaction ${
        nonce ? `(${nonce}) ` : ''
      }exceeds the maximum allowed nonce.`,
      { cause, name: 'NonceMaxValueError' },
    )
  }
}

export type InsufficientFundsErrorType = InsufficientFundsError & {
  name: 'InsufficientFundsError'
}
export class InsufficientFundsError extends BaseError {
  static nodeMessage =
    /insufficient funds|exceeds transaction sender account balance/
  constructor({ cause }: { cause?: BaseError | undefined } = {}) {
    super(
      [
        'The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account.',
      ].join('\n'),
      {
        cause,
        metaMessages: [
          'This error could arise when the account does not have enough funds to:',
          ' - pay for the total gas fee,',
          ' - pay for the value to send.',
          ' ',
          'The cost of the transaction is calculated as `gas * gas fee + value`, where:',
          ' - `gas` is the amount of gas needed for transaction to execute,',
          ' - `gas fee` is the gas fee,',
          ' - `value` is the amount of ether to send to the recipient.',
        ],
        name: 'InsufficientFundsError',
      },
    )
  }
}

export type IntrinsicGasTooHighErrorType = IntrinsicGasTooHighError & {
  name: 'IntrinsicGasTooHighError'
}
export class IntrinsicGasTooHighError extends BaseError {
  static nodeMessage = /intrinsic gas too high|gas limit reached/
  constructor({
    cause,
    gas,
  }: { cause?: BaseError | undefined; gas?: bigint | undefined } = {}) {
    super(
      `The amount of gas ${
        gas ? `(${gas}) ` : ''
      }provided for the transaction exceeds the limit allowed for the block.`,
      {
        cause,
        name: 'IntrinsicGasTooHighError',
      },
    )
  }
}

export type IntrinsicGasTooLowErrorType = IntrinsicGasTooLowError & {
  name: 'IntrinsicGasTooLowError'
}
export class IntrinsicGasTooLowError extends BaseError {
  static nodeMessage = /intrinsic gas too low/
  constructor({
    cause,
    gas,
  }: { cause?: BaseError | undefined; gas?: bigint | undefined } = {}) {
    super(
      `The amount of gas ${
        gas ? `(${gas}) ` : ''
      }provided for the transaction is too low.`,
      {
        cause,
        name: 'IntrinsicGasTooLowError',
      },
    )
  }
}

export type TransactionTypeNotSupportedErrorType =
  TransactionTypeNotSupportedError & {
    name: 'TransactionTypeNotSupportedError'
  }
export class TransactionTypeNotSupportedError extends BaseError {
  static nodeMessage = /transaction type not valid/
  constructor({ cause }: { cause?: BaseError | undefined }) {
    super('The transaction type is not supported for this chain.', {
      cause,
      name: 'TransactionTypeNotSupportedError',
    })
  }
}

export type TipAboveFeeCapErrorType = TipAboveFeeCapError & {
  name: 'TipAboveFeeCapError'
}
export class TipAboveFeeCapError extends BaseError {
  static nodeMessage =
    /max priority fee per gas higher than max fee per gas|tip higher than fee cap/
  constructor({
    cause,
    maxPriorityFeePerGas,
    maxFeePerGas,
  }: {
    cause?: BaseError | undefined
    maxPriorityFeePerGas?: bigint | undefined
    maxFeePerGas?: bigint | undefined
  } = {}) {
    super(
      [
        `The provided tip (\`maxPriorityFeePerGas\`${
          maxPriorityFeePerGas
            ? ` = ${formatGwei(maxPriorityFeePerGas)} gwei`
            : ''
        }) cannot be higher than the fee cap (\`maxFeePerGas\`${
          maxFeePerGas ? ` = ${formatGwei(maxFeePerGas)} gwei` : ''
        }).`,
      ].join('\n'),
      {
        cause,
        name: 'TipAboveFeeCapError',
      },
    )
  }
}

export type UnknownNodeErrorType = UnknownNodeError & {
  name: 'UnknownNodeError'
}
export class UnknownNodeError extends BaseError {
  constructor({ cause }: { cause?: BaseError | undefined }) {
    super(`An error occurred while executing: ${cause?.shortMessage}`, {
      cause,
      name: 'UnknownNodeError',
    })
  }
}
