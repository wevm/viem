import type { AbiError, Address, Hex } from 'ox'

import type * as ExecutionError from './ExecutionError.js'
import type * as accessKey from './actions/accessKey/errors.js'
import type * as amm from './actions/amm/errors.js'
import type * as channel from './actions/channel/errors.js'
import type * as dex from './actions/dex/errors.js'
import type * as fee from './actions/fee/errors.js'
import type * as nonce from './actions/nonce/errors.js'
import type * as policy from './actions/policy/errors.js'
import type * as token from './actions/token/errors.js'

import * as Errors from '../core/Errors.js'
import * as Json from '../utils/Json.js'

/** Thrown when a vault changes engines during a state read. */
export class GetVaultEngineChangedError extends Errors.BaseError {
  override readonly name = 'Actions.earn.getVault.EngineChangedError'

  constructor(options: { vault: Address.Address }) {
    super(`Engine of vault "${options.vault}" changed while reading.`, {
      metaMessages: [
        'An engine migration raced the snapshot; state from two different engines cannot be mixed.',
        'Retry the read.',
      ],
    })
  }
}

/** Thrown when a private deposit is not found before the timeout. */
export class WaitForPrivateDepositTimeoutError extends Errors.BaseError {
  override readonly name = 'Actions.earn.waitForPrivateDeposit.TimeoutError'

  constructor(options: { actionId: Hex.Hex; gateway: Address.Address }) {
    super(
      `Timed out while waiting for Zone deposit "${options.actionId}" at gateway "${options.gateway}".`,
    )
  }
}

/** Thrown when a private redemption is not found before the timeout. */
export class WaitForPrivateRedeemTimeoutError extends Errors.BaseError {
  override readonly name = 'Actions.earn.waitForPrivateRedeem.TimeoutError'

  constructor(options: { actionId: Hex.Hex; gateway: Address.Address }) {
    super(
      `Timed out while waiting for Zone redemption "${options.actionId}" at gateway "${options.gateway}".`,
    )
  }
}

/** Thrown when a fee token is not a valid TIP-20 fee token. */
export class InvalidFeeTokenError extends Errors.BaseError<
  Errors.BaseError | Error | undefined
> {
  override readonly name = 'InvalidFeeTokenError'

  constructor(options: {
    cause?: Errors.BaseError | Error | undefined
    token: string
  }) {
    const { cause, token } = options
    super(`Fee token "${token}" is invalid.`, {
      cause,
      docsPath: '/tempo/transactions#pay-fees-with-stablecoins',
      metaMessages: [
        'Fee tokens must be unpaused USD-denominated TIP-20 tokens.',
        'Use `client.fee.validateToken({ token })` before sending transactions or setting fee preferences.',
      ],
    })
  }
}

/** Thrown when a fee token is not a TIP-20 token. */
export class FeeTokenNotTip20Error extends Errors.BaseError {
  override readonly name = 'FeeTokenNotTip20Error'

  constructor(options: { token: string }) {
    const { token } = options
    super(`Fee token "${token}" is not a TIP-20 token.`, {
      docsPath: '/tempo/transactions#pay-fees-with-stablecoins',
      metaMessages: [
        'Fee tokens must be TIP-20 token addresses or token IDs.',
        'TIP-20 token addresses use the `0x20c0...` address prefix.',
      ],
    })
  }
}

/** Thrown when a fee token is not denominated in USD. */
export class FeeTokenNotUsdError extends Errors.BaseError {
  override readonly name = 'FeeTokenNotUsdError'

  constructor(options: { currency: string; token: string }) {
    const { currency, token } = options
    super(`Fee token "${token}" is denominated in "${currency}", not "USD".`, {
      docsPath: '/tempo/transactions#pay-fees-with-stablecoins',
      metaMessages: [
        'Only USD-denominated TIP-20 tokens can be used as fee tokens.',
      ],
    })
  }
}

/** Thrown when a fee token is paused. */
export class FeeTokenPausedError extends Errors.BaseError {
  override readonly name = 'FeeTokenPausedError'

  constructor(options: { token: string }) {
    const { token } = options
    super(`Fee token "${token}" is paused.`, {
      docsPath: '/tempo/transactions#pay-fees-with-stablecoins',
      metaMessages: ['Paused TIP-20 tokens cannot be used as fee tokens.'],
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
> extends Errors.BaseError<Error> {
  override name = 'TempoExecutionError'

  /** ABI item of the error. */
  abiItem: AbiError.AbiError
  /** Decoded error arguments, when the revert data carried them. */
  args: decoded['args']
  /** Revert data, or the error selector when only the name is known. */
  data: Hex.Hex
  /** Error name from `Abis.coreErrors`. */
  errorName: decoded['errorName']
  /** Steps to resolve the error. */
  hints: readonly string[]

  constructor(
    parameters: TempoExecutionError.Parameters,
    options: TempoExecutionError.Options = {},
  ) {
    const { cause, error, hints } = parameters
    const {
      details,
      docsPath,
      name = 'TempoExecutionError',
      shortMessage = error.message,
    } = options
    // Keep the call or request summary from the original error.
    const metaMessages =
      (cause as { metaMessages?: readonly string[] | undefined })
        .metaMessages ?? []
    const summary = metaMessages.findIndex((message) =>
      /^(Contract Call|Request Arguments):/.test(message),
    )
    const rows = details
      ? Object.fromEntries(
          Object.entries(details).filter(([, value]) => value !== undefined),
        )
      : undefined
    super(shortMessage, {
      cause,
      docsPath,
      metaMessages: [
        ...(rows && Object.keys(rows).length
          ? [Json.prettyPrint(rows), ' ']
          : []),
        ...(hints.length
          ? ['How to fix:', ...hints.map((hint) => `- ${hint}`), ' ']
          : []),
        ...(summary >= 0 ? metaMessages.slice(summary) : []),
      ],
    })
    this.name = name
    this.abiItem = error.abiItem as AbiError.AbiError
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
  /** Name of any decoded Tempo error. */
  type ErrorName = Decoded['errorName']
  /** Message options for subclasses. */
  type Options = {
    /** Rows printed below the short message. Empty values are omitted. */
    details?: Record<string, Json.prettyPrint.Value> | undefined
    /** Documentation path. */
    docsPath?: string | undefined
    /** Error name. Defaults to `TempoExecutionError`. */
    name?: string | undefined
    /** Short message. Defaults to the decoded error message. */
    shortMessage?: string | undefined
  }
  /** Constructor parameters. */
  type Parameters = {
    /** Original error. */
    cause: Error
    /** Decoded Tempo error. */
    error: Decoded
    /** Steps to resolve the error. */
    hints: readonly string[]
  }
}
