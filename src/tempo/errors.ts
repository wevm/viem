import type { AbiError, Address } from 'abitype'
import type { Hex } from 'ox'
import { BaseError } from '../errors/base.js'
import { prettyPrint } from '../errors/transaction.js'
import type * as accessKey from './actions/accessKey.js'
import type * as amm from './actions/amm.js'
import type * as channel from './actions/channel.js'
import type * as dex from './actions/dex.js'
import type * as fee from './actions/fee.js'
import type * as nonce from './actions/nonce.js'
import type * as policy from './actions/policy.js'
import type * as token from './actions/token.js'
import type * as ExecutionError from './ExecutionError.js'

export type GetVaultEngineChangedErrorType = GetVaultEngineChangedError & {
  name: 'GetVaultEngineChangedError'
}

export class GetVaultEngineChangedError extends BaseError {
  constructor({ vault }: { vault: Address }) {
    super(`Engine of vault "${vault}" changed while reading.`, {
      metaMessages: [
        'An engine migration raced the snapshot; state from two different engines cannot be mixed.',
        'Retry the read.',
      ],
      name: 'GetVaultEngineChangedError',
    })
  }
}

export type WaitForPrivateDepositTimeoutErrorType =
  WaitForPrivateDepositTimeoutError & {
    name: 'WaitForPrivateDepositTimeoutError'
  }

/** Thrown when a Zone gateway deposit event is not found before the timeout. */
export class WaitForPrivateDepositTimeoutError extends BaseError {
  constructor({ actionId, gateway }: { actionId: Hex.Hex; gateway: Address }) {
    super(
      `Timed out while waiting for Zone deposit "${actionId}" at gateway "${gateway}".`,
      { name: 'WaitForPrivateDepositTimeoutError' },
    )
  }
}

export type WaitForTempoBlockTimeoutErrorType =
  WaitForTempoBlockTimeoutError & {
    name: 'WaitForTempoBlockTimeoutError'
  }

export class WaitForTempoBlockTimeoutError extends BaseError {
  constructor({ tempoBlockNumber }: { tempoBlockNumber: bigint }) {
    super(
      `Timed out while waiting for Tempo block "${tempoBlockNumber}" to be imported by the zone.`,
      { name: 'WaitForTempoBlockTimeoutError' },
    )
  }
}

export type WaitForPrivateRedeemTimeoutErrorType =
  WaitForPrivateRedeemTimeoutError & {
    name: 'WaitForPrivateRedeemTimeoutError'
  }

/** Thrown when a Zone gateway redeem event is not found before the timeout. */
export class WaitForPrivateRedeemTimeoutError extends BaseError {
  constructor({ actionId, gateway }: { actionId: Hex.Hex; gateway: Address }) {
    super(
      `Timed out while waiting for Zone redemption "${actionId}" at gateway "${gateway}".`,
      { name: 'WaitForPrivateRedeemTimeoutError' },
    )
  }
}

export type InvalidFeeTokenErrorType = InvalidFeeTokenError & {
  name: 'InvalidFeeTokenError'
}
export class InvalidFeeTokenError extends BaseError {
  constructor({
    cause,
    token,
  }: {
    cause?: BaseError | Error | undefined
    token: string
  }) {
    super(`Fee token "${token}" is invalid.`, {
      cause,
      docsPath: '/tempo/transactions',
      docsSlug: 'pay-fees-with-stablecoins',
      metaMessages: [
        'Fee tokens must be unpaused USD-denominated TIP-20 tokens.',
        'Use `client.fee.validateToken({ token })` before sending transactions or setting fee preferences.',
      ],
      name: 'InvalidFeeTokenError',
    })
  }
}

export type FeeTokenNotTip20ErrorType = FeeTokenNotTip20Error & {
  name: 'FeeTokenNotTip20Error'
}
export class FeeTokenNotTip20Error extends BaseError {
  constructor({ token }: { token: string }) {
    super(`Fee token "${token}" is not a TIP-20 token.`, {
      docsPath: '/tempo/transactions',
      docsSlug: 'pay-fees-with-stablecoins',
      metaMessages: [
        'Fee tokens must be TIP-20 token addresses or token IDs.',
        'TIP-20 token addresses use the `0x20c0...` address prefix.',
      ],
      name: 'FeeTokenNotTip20Error',
    })
  }
}

export type FeeTokenNotUsdErrorType = FeeTokenNotUsdError & {
  name: 'FeeTokenNotUsdError'
}
export class FeeTokenNotUsdError extends BaseError {
  constructor({
    currency,
    token,
  }: {
    currency: string
    token: string
  }) {
    super(`Fee token "${token}" is denominated in "${currency}", not "USD".`, {
      docsPath: '/tempo/transactions',
      docsSlug: 'pay-fees-with-stablecoins',
      metaMessages: [
        'Only USD-denominated TIP-20 tokens can be used as fee tokens.',
      ],
      name: 'FeeTokenNotUsdError',
    })
  }
}

export type FeeTokenPausedErrorType = FeeTokenPausedError & {
  name: 'FeeTokenPausedError'
}
export class FeeTokenPausedError extends BaseError {
  constructor({ token }: { token: string }) {
    super(`Fee token "${token}" is paused.`, {
      docsPath: '/tempo/transactions',
      docsSlug: 'pay-fees-with-stablecoins',
      metaMessages: ['Paused TIP-20 tokens cannot be used as fee tokens.'],
      name: 'FeeTokenPausedError',
    })
  }
}

/**
 * Errors thrown by Tempo actions for decoded Tempo precompile errors. Narrow with `error.name`,
 * then `error.errorName` for the base `TempoExecutionError`.
 */
export type ExecutionErrorType =
  | TempoExecutionErrorType
  | accessKey.ExecutionErrorType
  | amm.ExecutionErrorType
  | channel.ExecutionErrorType
  | dex.ExecutionErrorType
  | fee.ExecutionErrorType
  | nonce.ExecutionErrorType
  | policy.ExecutionErrorType
  | token.ExecutionErrorType

/** Union of `TempoExecutionError` per decoded error, so `errorName` narrows `args`. */
export type TempoExecutionErrorType<
  decoded extends TempoExecutionError.Decoded = TempoExecutionError.Decoded,
> = decoded extends TempoExecutionError.Decoded
  ? TempoExecutionError<decoded> & { name: 'TempoExecutionError' }
  : never

/** Thrown when a Tempo action fails with a decoded Tempo precompile error. */
export class TempoExecutionError<
  decoded extends TempoExecutionError.Decoded = TempoExecutionError.Decoded,
> extends BaseError {
  abiItem: AbiError
  args: decoded['args']
  data: Hex.Hex
  errorName: decoded['errorName']
  /** Steps to resolve the error. */
  hints: readonly string[]

  constructor(
    { cause, error, hints }: TempoExecutionError.Parameters,
    {
      details,
      docsPath,
      name = 'TempoExecutionError',
      shortMessage = error.message,
    }: TempoExecutionError.Options = {},
  ) {
    // Keep the call or request summary from the original error.
    const summary = cause.metaMessages?.findIndex((message) =>
      /^(Contract Call|Request Arguments):/.test(message),
    )
    super(shortMessage, {
      cause,
      docsPath,
      metaMessages: [
        ...(details ? [prettyPrint(details), ' '] : []),
        ...(hints.length
          ? ['How to fix:', ...hints.map((hint) => `- ${hint}`), ' ']
          : []),
        ...(summary !== undefined && summary >= 0
          ? cause.metaMessages!.slice(summary)
          : []),
      ],
      name,
    })
    this.abiItem = error.abiItem as AbiError
    // Subclasses narrow `decoded` to the error they are built for.
    this.args = error.args as decoded['args']
    this.data = error.data
    this.errorName = error.errorName as decoded['errorName']
    this.hints = hints
  }
}

export declare namespace TempoExecutionError {
  /** Decoded Tempo error, optionally narrowed to `name`. */
  type Decoded<name extends string = string> = Extract<
    Exclude<ExecutionError.ExecutionError, { errorName: 'unknown' }>,
    { errorName: name }
  >
  type ErrorName = Decoded['errorName']
  type Options = {
    /** Rows printed below the short message. Empty values are omitted. */
    details?: Record<string, unknown> | undefined
    docsPath?: string | undefined
    name?: string | undefined
    shortMessage?: string | undefined
  }
  type Parameters = {
    cause: BaseError
    error: Decoded
    hints: readonly string[]
  }
}
