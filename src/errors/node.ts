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

  override name = 'ExecutionRevertedError'

  constructor({
    cause,
    message,
  }: { cause?: BaseError; message?: string } = {}) {
    const reason = message
      ?.replace('execution reverted: ', '')
      ?.replace('execution reverted', '')
    super(
      `Execution reverted ${
        reason ? `with reason: ${reason}` : 'for an unknown reason'
      }.`,
      {
        cause,
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
  override name = 'FeeCapTooHigh'
  constructor({
    cause,
    maxFeePerGas,
  }: { cause?: BaseError; maxFeePerGas?: bigint } = {}) {
    super(
      `The fee cap (\`maxFeePerGas\`${
        maxFeePerGas ? ` = ${formatGwei(maxFeePerGas)} gwei` : ''
      }) cannot be higher than the maximum allowed value (2^256-1).`,
      {
        cause,
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
  override name = 'FeeCapTooLow'
  constructor({
    cause,
    maxFeePerGas,
  }: { cause?: BaseError; maxFeePerGas?: bigint } = {}) {
    super(
      `The fee cap (\`maxFeePerGas\`${
        maxFeePerGas ? ` = ${formatGwei(maxFeePerGas)}` : ''
      } gwei) cannot be lower than the block base fee.`,
      {
        cause,
      },
    )
  }
}

export type NonceTooHighErrorType = NonceTooHighError & {
  name: 'NonceTooHighError'
}
export class NonceTooHighError extends BaseError {
  static nodeMessage = /nonce too high/
  override name = 'NonceTooHighError'
  constructor({ cause, nonce }: { cause?: BaseError; nonce?: number } = {}) {
    super(
      `Nonce provided for the transaction ${
        nonce ? `(${nonce}) ` : ''
      }is higher than the next one expected.`,
      { cause },
    )
  }
}

export type NonceTooLowErrorType = NonceTooLowError & {
  name: 'NonceTooLowError'
}
export class NonceTooLowError extends BaseError {
  static nodeMessage =
    /nonce too low|transaction already imported|already known/
  override name = 'NonceTooLowError'
  constructor({ cause, nonce }: { cause?: BaseError; nonce?: number } = {}) {
    super(
      [
        `Nonce provided for the transaction ${
          nonce ? `(${nonce}) ` : ''
        }is lower than the current nonce of the account.`,
        'Try increasing the nonce or find the latest nonce with `getTransactionCount`.',
      ].join('\n'),
      { cause },
    )
  }
}

export type NonceMaxValueErrorType = NonceMaxValueError & {
  name: 'NonceMaxValueError'
}
export class NonceMaxValueError extends BaseError {
  static nodeMessage = /nonce has max value/
  override name = 'NonceMaxValueError'
  constructor({ cause, nonce }: { cause?: BaseError; nonce?: number } = {}) {
    super(
      `Nonce provided for the transaction ${
        nonce ? `(${nonce}) ` : ''
      }exceeds the maximum allowed nonce.`,
      { cause },
    )
  }
}

export type InsufficientFundsErrorType = InsufficientFundsError & {
  name: 'InsufficientFundsError'
}
export class InsufficientFundsError extends BaseError {
  static nodeMessage = /insufficient funds/
  override name = 'InsufficientFundsError'
  constructor({ cause }: { cause?: BaseError } = {}) {
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
      },
    )
  }
}

export type IntrinsicGasTooHighErrorType = IntrinsicGasTooHighError & {
  name: 'IntrinsicGasTooHighError'
}
export class IntrinsicGasTooHighError extends BaseError {
  static nodeMessage = /intrinsic gas too high|gas limit reached/
  override name = 'IntrinsicGasTooHighError'
  constructor({ cause, gas }: { cause?: BaseError; gas?: bigint } = {}) {
    super(
      `The amount of gas ${
        gas ? `(${gas}) ` : ''
      }provided for the transaction exceeds the limit allowed for the block.`,
      {
        cause,
      },
    )
  }
}

export type IntrinsicGasTooLowErrorType = IntrinsicGasTooLowError & {
  name: 'IntrinsicGasTooLowError'
}
export class IntrinsicGasTooLowError extends BaseError {
  static nodeMessage = /intrinsic gas too low/
  override name = 'IntrinsicGasTooLowError'
  constructor({ cause, gas }: { cause?: BaseError; gas?: bigint } = {}) {
    super(
      `The amount of gas ${
        gas ? `(${gas}) ` : ''
      }provided for the transaction is too low.`,
      {
        cause,
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
  override name = 'TransactionTypeNotSupportedError'
  constructor({ cause }: { cause?: BaseError }) {
    super('The transaction type is not supported for this chain.', {
      cause,
    })
  }
}

export type TipAboveFeeCapErrorType = TipAboveFeeCapError & {
  name: 'TipAboveFeeCapError'
}
export class TipAboveFeeCapError extends BaseError {
  static nodeMessage =
    /max priority fee per gas higher than max fee per gas|tip higher than fee cap/
  override name = 'TipAboveFeeCapError'
  constructor({
    cause,
    maxPriorityFeePerGas,
    maxFeePerGas,
  }: {
    cause?: BaseError
    maxPriorityFeePerGas?: bigint
    maxFeePerGas?: bigint
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
      },
    )
  }
}

export type UnknownNodeErrorType = UnknownNodeError & {
  name: 'UnknownNodeError'
}
export class UnknownNodeError extends BaseError {
  override name = 'UnknownNodeError'

  constructor({ cause }: { cause?: BaseError }) {
    super(`An error occurred while executing: ${cause?.shortMessage}`, {
      cause,
    })
  }
}
