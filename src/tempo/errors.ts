import type { AbiError, Address } from 'abitype'
import type { Hex } from 'ox'
import { BaseError } from '../errors/base.js'
import { prettyPrint } from '../errors/transaction.js'
import { formatUnits } from '../utils/unit/formatUnits.js'
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

export type TempoExecutionErrorType = TempoExecutionError & {
  name: 'TempoExecutionError'
}

/** Thrown when a Tempo action fails with a decoded Tempo precompile error. */
export class TempoExecutionError extends BaseError {
  abiItem: AbiError
  args: readonly unknown[] | undefined
  data: Hex.Hex
  errorName: TempoExecutionError.ErrorName
  /** Steps to resolve the error. */
  hints: readonly string[]

  constructor(
    { cause, error, hints }: TempoExecutionError.Parameters,
    {
      details,
      docsPath,
      name = 'TempoExecutionError',
      shortMessage = error.message,
    }: {
      details?: Record<string, unknown> | undefined
      docsPath?: string | undefined
      name?: string | undefined
      shortMessage?: string | undefined
    } = {},
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
    this.args = error.args as readonly unknown[] | undefined
    this.data = error.data
    this.errorName = error.errorName
    this.hints = hints
  }
}

export declare namespace TempoExecutionError {
  type Decoded = Exclude<
    ExecutionError.ExecutionError,
    { errorName: 'unknown' }
  >
  type ErrorName = Decoded['errorName']
  type Parameters = {
    cause: BaseError
    error: Decoded
    hints: readonly string[]
  }
}

export type AccessKeyErrorType = AccessKeyError & { name: 'AccessKeyError' }

/** Thrown when an access key fails an `AccountKeychain` check. */
export class AccessKeyError extends TempoExecutionError {
  /** Root account that owns the access key. */
  account: Address
  /** Access key address. */
  accessKey: Address

  constructor(
    parameters: AccessKeyError.Parameters,
    options: {
      details?: Record<string, unknown> | undefined
      name?: string | undefined
      shortMessage?: string | undefined
    } = {},
  ) {
    const { account, accessKey } = parameters
    super(parameters, {
      shortMessage: `Access key "${accessKey}" failed: ${parameters.error.message}`,
      ...options,
      details: {
        account,
        'access key': accessKey,
        ...options.details,
      },
      docsPath: '/tempo/guides/access-keys/manage',
      name: options.name ?? 'AccessKeyError',
    })
    this.account = account
    this.accessKey = accessKey
  }
}

export declare namespace AccessKeyError {
  type Parameters = TempoExecutionError.Parameters & {
    account: Address
    accessKey: Address
  }
}

export type AccessKeySpendingLimitExceededErrorType =
  AccessKeySpendingLimitExceededError & {
    name: 'AccessKeySpendingLimitExceededError'
  }

/** Thrown when a transfer, approval, or fee payment exceeds an access key's spending limit. */
export class AccessKeySpendingLimitExceededError extends AccessKeyError {
  /** Amount the call tried to spend, when known. */
  amount: bigint | undefined
  /** Token decimals, when known. */
  decimals: number | undefined
  /** Whether the fee payment, rather than the call, exceeded the limit. */
  fee: boolean
  /** End of the current period (Unix seconds) for periodic limits, when known. */
  periodEnd: bigint | undefined
  /** Remaining limit for `token`, when known. */
  remaining: bigint | undefined
  /** Token the limit applies to, when known. */
  token: Address | undefined

  constructor(parameters: AccessKeySpendingLimitExceededError.Parameters) {
    const { amount, decimals, fee, periodEnd, remaining, token } = parameters
    const format = (value: bigint | undefined) =>
      value === undefined
        ? undefined
        : decimals === undefined
          ? value.toString()
          : `${formatUnits(value, decimals)} (${value})`
    super(parameters, {
      details: {
        token,
        amount: format(amount),
        remaining: format(remaining),
        'exceeded by':
          amount !== undefined && remaining !== undefined
            ? format(amount - remaining)
            : undefined,
        'resets at': periodEnd
          ? new Date(Number(periodEnd) * 1000).toISOString()
          : undefined,
      },
      name: 'AccessKeySpendingLimitExceededError',
      shortMessage: `Access key "${parameters.accessKey}" exceeded its spending limit${token ? ` for token "${token}"` : ''}${fee ? ' while paying fees' : ''}.`,
    })
    this.amount = amount
    this.decimals = decimals
    this.fee = fee
    this.periodEnd = periodEnd
    this.remaining = remaining
    this.token = token
  }
}

export declare namespace AccessKeySpendingLimitExceededError {
  type Parameters = AccessKeyError.Parameters & {
    amount?: bigint | undefined
    decimals?: number | undefined
    fee: boolean
    periodEnd?: bigint | undefined
    remaining?: bigint | undefined
    token?: Address | undefined
  }
}

export type AccessKeyExpiredErrorType = AccessKeyExpiredError & {
  name: 'AccessKeyExpiredError'
}

/** Thrown when a transaction is signed with an expired access key. */
export class AccessKeyExpiredError extends AccessKeyError {
  /** Expiry (Unix seconds), when known. */
  expiry: bigint | undefined

  constructor(parameters: AccessKeyExpiredError.Parameters) {
    const { expiry } = parameters
    const expiredAt = expiry
      ? new Date(Number(expiry) * 1000).toISOString()
      : undefined
    super(parameters, {
      details: { 'expired at': expiredAt },
      name: 'AccessKeyExpiredError',
      shortMessage: `Access key "${parameters.accessKey}" has expired.`,
    })
    this.expiry = expiry
  }
}

export declare namespace AccessKeyExpiredError {
  type Parameters = AccessKeyError.Parameters & {
    expiry?: bigint | undefined
  }
}

export type AccessKeyCallNotAllowedErrorType = AccessKeyCallNotAllowedError & {
  name: 'AccessKeyCallNotAllowedError'
}

/** Thrown when an access key's scopes do not allow a call. */
export class AccessKeyCallNotAllowedError extends AccessKeyError {
  /** Function selector of the rejected call, when known. */
  selector: Hex.Hex | undefined
  /** Target of the rejected call, when known. */
  target: Address | undefined

  constructor(parameters: AccessKeyCallNotAllowedError.Parameters) {
    const { selector, target } = parameters
    super(parameters, {
      details: { target, selector },
      name: 'AccessKeyCallNotAllowedError',
      shortMessage: `Access key "${parameters.accessKey}" is not allowed to make this call.`,
    })
    this.selector = selector
    this.target = target
  }
}

export declare namespace AccessKeyCallNotAllowedError {
  type Parameters = AccessKeyError.Parameters & {
    selector?: Hex.Hex | undefined
    target?: Address | undefined
  }
}
