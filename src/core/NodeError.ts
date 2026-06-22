import type * as Hex from 'ox/Hex'
import * as Value from 'ox/Value'

import { BaseError } from './Errors.js'

/**
 * Node (execution) error taxonomy. These mirror the failure modes a JSON-RPC
 * node surfaces when validating or executing a transaction, mapped from the
 * raw RPC error by the action layer.
 *
 * @see geth https://github.com/ethereum/go-ethereum/blob/master/core/error.go
 * @see anvil https://github.com/foundry-rs/foundry/blob/master/crates/anvil/src/eth/error.rs
 */

const gwei = (value: bigint) => `${Value.formatGwei(value)} gwei`

/** Thrown when a contract execution reverted. */
export class ExecutionRevertedError extends BaseError<Error> {
  static code = 3
  static nodeMessage = /execution reverted|gas required exceeds allowance/

  override readonly name = 'NodeError.ExecutionRevertedError'

  constructor(
    options: { cause?: Error | undefined; message?: string | undefined } = {},
  ) {
    const reason = options.message
      ?.replace('execution reverted: ', '')
      ?.replace('execution reverted', '')
    super(
      `Execution reverted ${
        reason ? `with reason: ${reason}` : 'for an unknown reason'
      }.`,
      { cause: options.cause },
    )
  }
}

/** Thrown when the fee cap (`maxFeePerGas`) exceeds the maximum allowed value. */
export class FeeCapTooHighError extends BaseError<Error> {
  static nodeMessage =
    /max fee per gas higher than 2\^256-1|fee cap higher than 2\^256-1/

  override readonly name = 'NodeError.FeeCapTooHighError'

  constructor(
    options: {
      cause?: Error | undefined
      maxFeePerGas?: bigint | undefined
    } = {},
  ) {
    super(
      `The fee cap (\`maxFeePerGas\`${
        options.maxFeePerGas ? ` = ${gwei(options.maxFeePerGas)}` : ''
      }) cannot be higher than the maximum allowed value (2^256-1).`,
      { cause: options.cause },
    )
  }
}

/** Thrown when the fee cap (`maxFeePerGas`) is lower than the block base fee. */
export class FeeCapTooLowError extends BaseError<Error> {
  static nodeMessage =
    /max fee per gas less than block base fee|fee cap less than block base fee|transaction is outdated/

  override readonly name = 'NodeError.FeeCapTooLowError'

  constructor(
    options: {
      cause?: Error | undefined
      maxFeePerGas?: bigint | undefined
    } = {},
  ) {
    super(
      `The fee cap (\`maxFeePerGas\`${
        options.maxFeePerGas ? ` = ${gwei(options.maxFeePerGas)}` : ''
      }) cannot be lower than the block base fee.`,
      { cause: options.cause },
    )
  }
}

/** Thrown when the nonce is higher than the next expected nonce. */
export class NonceTooHighError extends BaseError<Error> {
  static nodeMessage = /nonce too high/

  override readonly name = 'NodeError.NonceTooHighError'

  constructor(
    options: { cause?: Error | undefined; nonce?: number | undefined } = {},
  ) {
    super(
      `Nonce provided for the transaction ${
        options.nonce ? `(${options.nonce}) ` : ''
      }is higher than the next one expected.`,
      { cause: options.cause },
    )
  }
}

/** Thrown when the nonce is lower than the current nonce of the account. */
export class NonceTooLowError extends BaseError<Error> {
  static nodeMessage =
    /nonce too low|transaction already imported|already known/

  override readonly name = 'NodeError.NonceTooLowError'

  constructor(
    options: { cause?: Error | undefined; nonce?: number | undefined } = {},
  ) {
    super(
      [
        `Nonce provided for the transaction ${
          options.nonce ? `(${options.nonce}) ` : ''
        }is lower than the current nonce of the account.`,
        'Try increasing the nonce or find the latest nonce with `getTransactionCount`.',
      ].join('\n'),
      { cause: options.cause },
    )
  }
}

/** Thrown when the nonce exceeds the maximum allowed value. */
export class NonceMaxValueError extends BaseError<Error> {
  static nodeMessage = /nonce has max value/

  override readonly name = 'NodeError.NonceMaxValueError'

  constructor(
    options: { cause?: Error | undefined; nonce?: number | undefined } = {},
  ) {
    super(
      `Nonce provided for the transaction ${
        options.nonce ? `(${options.nonce}) ` : ''
      }exceeds the maximum allowed nonce.`,
      { cause: options.cause },
    )
  }
}

/** Thrown when the account has insufficient funds to execute the transaction. */
export class InsufficientFundsError extends BaseError<Error> {
  static nodeMessage =
    /insufficient funds|exceeds transaction sender account balance/

  override readonly name = 'NodeError.InsufficientFundsError'

  constructor(options: { cause?: Error | undefined } = {}) {
    super(
      'The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account.',
      {
        cause: options.cause,
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

/** Thrown when the transaction gas exceeds the block gas limit. */
export class IntrinsicGasTooHighError extends BaseError<Error> {
  static nodeMessage = /intrinsic gas too high|gas limit reached/

  override readonly name = 'NodeError.IntrinsicGasTooHighError'

  constructor(
    options: { cause?: Error | undefined; gas?: bigint | undefined } = {},
  ) {
    super(
      `The amount of gas ${
        options.gas ? `(${options.gas}) ` : ''
      }provided for the transaction exceeds the limit allowed for the block.`,
      { cause: options.cause },
    )
  }
}

/** Thrown when the transaction gas is too low. */
export class IntrinsicGasTooLowError extends BaseError<Error> {
  static nodeMessage = /intrinsic gas too low/

  override readonly name = 'NodeError.IntrinsicGasTooLowError'

  constructor(
    options: { cause?: Error | undefined; gas?: bigint | undefined } = {},
  ) {
    super(
      `The amount of gas ${
        options.gas ? `(${options.gas}) ` : ''
      }provided for the transaction is too low.`,
      { cause: options.cause },
    )
  }
}

/** Thrown when the transaction type is not supported by the chain. */
export class TransactionTypeNotSupportedError extends BaseError<Error> {
  static nodeMessage = /transaction type not valid/

  override readonly name = 'NodeError.TransactionTypeNotSupportedError'

  constructor(options: { cause?: Error | undefined } = {}) {
    super('The transaction type is not supported for this chain.', {
      cause: options.cause,
    })
  }
}

/** Thrown when the tip (`maxPriorityFeePerGas`) is higher than the fee cap. */
export class TipAboveFeeCapError extends BaseError<Error> {
  static nodeMessage =
    /max priority fee per gas higher than max fee per gas|tip higher than fee cap/

  override readonly name = 'NodeError.TipAboveFeeCapError'

  constructor(
    options: {
      cause?: Error | undefined
      maxPriorityFeePerGas?: bigint | undefined
      maxFeePerGas?: bigint | undefined
    } = {},
  ) {
    super(
      `The provided tip (\`maxPriorityFeePerGas\`${
        options.maxPriorityFeePerGas
          ? ` = ${gwei(options.maxPriorityFeePerGas)}`
          : ''
      }) cannot be higher than the fee cap (\`maxFeePerGas\`${
        options.maxFeePerGas ? ` = ${gwei(options.maxFeePerGas)}` : ''
      }).`,
      { cause: options.cause },
    )
  }
}

/** Thrown when a node error could not be matched to a known taxonomy entry. */
export class UnknownNodeError extends BaseError<Error> {
  override readonly name = 'NodeError.UnknownNodeError'

  constructor(options: { cause?: Error | undefined } = {}) {
    const cause = options.cause as
      | (Error & { shortMessage?: string | undefined })
      | undefined
    super(
      `An error occurred while executing: ${
        cause?.shortMessage ?? cause?.message
      }`,
      { cause },
    )
  }
}

/**
 * Collects the candidate human-readable messages from a thrown RPC error,
 * walking its `cause` chain and any nested `data` payload. ox's
 * `RpcResponse.parseError` wraps an unknown node error (e.g. an EVM revert,
 * code `3`) as an `InternalError` carrying the original error object on `data`,
 * so the useful message can live at `error.data.message` rather than the
 * top-level `message`.
 *
 * @internal
 */
function getMessages(error: unknown): string[] {
  const messages: string[] = []
  let current: unknown = error
  while (current && typeof current === 'object') {
    const value = current as {
      details?: unknown
      message?: unknown
      data?: unknown
      cause?: unknown
    }
    if (typeof value.details === 'string') messages.push(value.details)
    if (typeof value.message === 'string') messages.push(value.message)
    if (value.data && typeof value.data === 'object') {
      const data = value.data as { message?: unknown }
      if (typeof data.message === 'string') messages.push(data.message)
    }
    current = value.cause
  }
  return messages
}

/**
 * Returns `true` when the error (or a nested `data`/`cause`) carries the EVM
 * execution-reverted code (`3`).
 *
 * @internal
 */
function hasExecutionRevertedCode(error: unknown): boolean {
  let current: unknown = error
  while (current && typeof current === 'object') {
    const value = current as { code?: unknown; data?: unknown; cause?: unknown }
    if (value.code === ExecutionRevertedError.code) return true
    const data = value.data as { code?: unknown } | undefined
    if (
      data &&
      typeof data === 'object' &&
      data.code === ExecutionRevertedError.code
    )
      return true
    current = value.cause
  }
  return false
}

/**
 * Maps a raw RPC error thrown by a transport into the {@link NodeError} taxonomy
 * by matching the node's message against each error's `nodeMessage` regex
 * (execution-revert detection comes first). Returns {@link UnknownNodeError}
 * when no entry matches.
 *
 * @internal
 */
export function fromRpcError(
  error: Error,
  options: fromRpcError.Options = {},
):
  | ExecutionRevertedError
  | FeeCapTooHighError
  | FeeCapTooLowError
  | NonceTooHighError
  | NonceTooLowError
  | NonceMaxValueError
  | InsufficientFundsError
  | IntrinsicGasTooHighError
  | IntrinsicGasTooLowError
  | TransactionTypeNotSupportedError
  | TipAboveFeeCapError
  | UnknownNodeError {
  const candidates = getMessages(error)
  const message = candidates.join('\n').toLowerCase()

  const gas = typeof options.gas === 'bigint' ? options.gas : undefined
  const maxFeePerGas =
    typeof options.maxFeePerGas === 'bigint' ? options.maxFeePerGas : undefined
  const maxPriorityFeePerGas =
    typeof options.maxPriorityFeePerGas === 'bigint'
      ? options.maxPriorityFeePerGas
      : undefined
  const nonce = typeof options.nonce === 'number' ? options.nonce : undefined

  if (
    hasExecutionRevertedCode(error) ||
    ExecutionRevertedError.nodeMessage.test(message)
  )
    return new ExecutionRevertedError({
      cause: error,
      message:
        candidates.find((candidate) => /execution reverted/i.test(candidate)) ??
        candidates[0],
    })
  if (FeeCapTooHighError.nodeMessage.test(message))
    return new FeeCapTooHighError({ cause: error, maxFeePerGas })
  if (FeeCapTooLowError.nodeMessage.test(message))
    return new FeeCapTooLowError({ cause: error, maxFeePerGas })
  if (NonceTooHighError.nodeMessage.test(message))
    return new NonceTooHighError({ cause: error, nonce })
  if (NonceTooLowError.nodeMessage.test(message))
    return new NonceTooLowError({ cause: error, nonce })
  if (NonceMaxValueError.nodeMessage.test(message))
    return new NonceMaxValueError({ cause: error, nonce })
  if (InsufficientFundsError.nodeMessage.test(message))
    return new InsufficientFundsError({ cause: error })
  if (IntrinsicGasTooHighError.nodeMessage.test(message))
    return new IntrinsicGasTooHighError({ cause: error, gas })
  if (IntrinsicGasTooLowError.nodeMessage.test(message))
    return new IntrinsicGasTooLowError({ cause: error, gas })
  if (TransactionTypeNotSupportedError.nodeMessage.test(message))
    return new TransactionTypeNotSupportedError({ cause: error })
  if (TipAboveFeeCapError.nodeMessage.test(message))
    return new TipAboveFeeCapError({
      cause: error,
      maxFeePerGas,
      maxPriorityFeePerGas,
    })
  return new UnknownNodeError({ cause: error })
}

export declare namespace fromRpcError {
  type Options = {
    /** Gas limit attached to the failing call (for error formatting). */
    gas?: bigint | number | Hex.Hex | undefined
    /** EIP-1559 fee cap attached to the failing call (for error formatting). */
    maxFeePerGas?: bigint | number | Hex.Hex | undefined
    /** EIP-1559 priority fee attached to the failing call (for error formatting). */
    maxPriorityFeePerGas?: bigint | number | Hex.Hex | undefined
    /** Nonce attached to the failing call (for error formatting). */
    nonce?: bigint | number | Hex.Hex | undefined
  }
}
