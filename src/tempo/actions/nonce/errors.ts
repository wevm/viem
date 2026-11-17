import { TempoExecutionError } from '../../errors.js'
import { formatTime, type Resolvers } from '../../internal/errors.js'

/** Errors this module throws for decoded Tempo errors. Narrow with `error.name`. */
export type ExecutionErrorType =
  | NonceInvalidExpiryErrorType
  | NonceReplayErrorType

/** `NonceReplayError` with a literal `name`, for narrowing. */
export type NonceReplayErrorType = NonceReplayError & {
  name: 'NonceReplayError'
}

/** Thrown when an expiring nonce transaction was already submitted. */
export class NonceReplayError extends TempoExecutionError<
  TempoExecutionError.Decoded<'ExpiringNonceReplay'>
> {
  /** Transaction expiry (Unix seconds), when known. */
  validBefore: number | bigint | undefined

  constructor(
    parameters: TempoExecutionError.Parameters & {
      validBefore?: number | bigint | undefined
    },
  ) {
    super(parameters, {
      details: { 'valid before': formatTime(parameters.validBefore) },
      name: 'NonceReplayError',
    })
    this.validBefore = parameters.validBefore
  }
}

/** `NonceInvalidExpiryError` with a literal `name`, for narrowing. */
export type NonceInvalidExpiryErrorType = NonceInvalidExpiryError & {
  name: 'NonceInvalidExpiryError'
}

/** Thrown when an expiring nonce transaction's `validBefore` is in the past or too far ahead. */
export class NonceInvalidExpiryError extends TempoExecutionError<
  TempoExecutionError.Decoded<'InvalidExpiringNonceExpiry'>
> {
  /** Current time (Unix seconds) when the error was handled. */
  now: number
  /** Transaction expiry (Unix seconds), when known. */
  validBefore: number | bigint | undefined

  constructor(
    parameters: TempoExecutionError.Parameters & {
      validBefore?: number | bigint | undefined
    },
  ) {
    const now = Math.floor(Date.now() / 1000)
    super(parameters, {
      details: {
        'valid before': formatTime(parameters.validBefore),
        now: formatTime(now),
      },
      name: 'NonceInvalidExpiryError',
    })
    this.now = now
    this.validBefore = parameters.validBefore
  }
}

/** @internal */
export const errorResolvers: Resolvers = {
  'ExpiringNonceReplay()': ({ base, parameters }) =>
    new NonceReplayError({ ...base, validBefore: parameters.validBefore }),
  'InvalidExpiringNonceExpiry()': ({ base, parameters }) =>
    new NonceInvalidExpiryError({
      ...base,
      validBefore: parameters.validBefore,
    }),
}
