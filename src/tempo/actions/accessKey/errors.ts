import type { Hex } from 'ox'
import { Address, AbiItem } from 'ox'

import * as viem_Account from '../../../core/Account.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'
import { TempoExecutionError } from '../../errors.js'
import {
  type Context,
  formatAmount,
  formatTime,
  getFeeToken,
  type Resolvers,
} from '../../internal/errors.js'
import { isTip20 } from '../../internal/utils.js'
import { signatureTypes } from './internal.js'

/** Errors this module throws for decoded Tempo errors. Narrow with `error.name`. */
export type ExecutionErrorType =
  | AccessKeyAlreadyExistsErrorType
  | AccessKeyCallNotAllowedErrorType
  | AccessKeyErrorType
  | AccessKeyExpiredErrorType
  | AccessKeyExpiryInPastErrorType
  | AccessKeySignatureTypeMismatchErrorType
  | AccessKeySpendingLimitExceededErrorType

/** `AccessKeyError` with a literal `name`, for narrowing. */
export type AccessKeyErrorType = AccessKeyError & { name: 'AccessKeyError' }

/** Thrown when an access key fails an `AccountKeychain` check. */
export class AccessKeyError<
  decoded extends TempoExecutionError.Decoded = TempoExecutionError.Decoded,
> extends TempoExecutionError<decoded> {
  /** Root account that owns the access key. */
  account: Address.Address
  /** Access key address. */
  accessKey: Address.Address

  constructor(
    parameters: AccessKeyError.Parameters,
    options: TempoExecutionError.Options = {},
  ) {
    const { account, accessKey } = parameters
    super(parameters, {
      shortMessage: `Access key "${accessKey}" failed: ${parameters.error.message}`,
      ...options,
      details: { account, 'access key': accessKey, ...options.details },
      docsPath: '/tempo/guides/access-keys/manage',
      name: options.name ?? 'AccessKeyError',
    })
    this.account = account
    this.accessKey = accessKey
  }
}

export declare namespace AccessKeyError {
  /** Constructor parameters. */
  type Parameters = TempoExecutionError.Parameters & {
    /** Root account that owns the access key. */
    account: Address.Address
    /** Access key address. */
    accessKey: Address.Address
  }
}

/** `AccessKeySpendingLimitExceededError` with a literal `name`, for narrowing. */
export type AccessKeySpendingLimitExceededErrorType =
  AccessKeySpendingLimitExceededError & {
    name: 'AccessKeySpendingLimitExceededError'
  }

/** Thrown when a transfer, approval, or fee payment exceeds an access key's spending limit. */
export class AccessKeySpendingLimitExceededError extends AccessKeyError<
  TempoExecutionError.Decoded<'SpendingLimitExceeded'>
> {
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
  token: Address.Address | undefined

  constructor(parameters: AccessKeySpendingLimitExceededError.Parameters) {
    const { amount, decimals, fee, periodEnd, remaining, token } = parameters
    super(parameters, {
      details: {
        token,
        amount: formatAmount(amount, decimals),
        remaining: formatAmount(remaining, decimals),
        'exceeded by':
          amount !== undefined && remaining !== undefined
            ? formatAmount(amount - remaining, decimals)
            : undefined,
        'resets at': formatTime(periodEnd),
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
  /** Constructor parameters. */
  type Parameters = AccessKeyError.Parameters & {
    /** Amount the call tried to spend, when known. */
    amount?: bigint | undefined
    /** Token decimals, when known. */
    decimals?: number | undefined
    /** Whether the fee payment, rather than the call, exceeded the limit. */
    fee: boolean
    /** End of the current period (Unix seconds) for periodic limits, when known. */
    periodEnd?: bigint | undefined
    /** Remaining limit for `token`, when known. */
    remaining?: bigint | undefined
    /** Token the limit applies to, when known. */
    token?: Address.Address | undefined
  }
}

/** `AccessKeyExpiredError` with a literal `name`, for narrowing. */
export type AccessKeyExpiredErrorType = AccessKeyExpiredError & {
  name: 'AccessKeyExpiredError'
}

/** Thrown when a transaction is signed with an expired access key. */
export class AccessKeyExpiredError extends AccessKeyError<
  TempoExecutionError.Decoded<'KeyExpired'>
> {
  /** Expiry (Unix seconds), when known. */
  expiry: bigint | undefined

  constructor(
    parameters: AccessKeyError.Parameters & { expiry?: bigint | undefined },
  ) {
    super(parameters, {
      details: { 'expired at': formatTime(parameters.expiry) },
      name: 'AccessKeyExpiredError',
      shortMessage: `Access key "${parameters.accessKey}" has expired.`,
    })
    this.expiry = parameters.expiry
  }
}

/** `AccessKeyCallNotAllowedError` with a literal `name`, for narrowing. */
export type AccessKeyCallNotAllowedErrorType = AccessKeyCallNotAllowedError & {
  name: 'AccessKeyCallNotAllowedError'
}

/** Thrown when an access key's scopes do not allow a call. */
export class AccessKeyCallNotAllowedError extends AccessKeyError<
  TempoExecutionError.Decoded<'CallNotAllowed'>
> {
  /** Function selector of the rejected call, when known. */
  selector: Hex.Hex | undefined
  /** Target of the rejected call, when known. */
  target: Address.Address | undefined

  constructor(
    parameters: AccessKeyError.Parameters & {
      selector?: Hex.Hex | undefined
      target?: Address.Address | undefined
    },
  ) {
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

/** `AccessKeyAlreadyExistsError` with a literal `name`, for narrowing. */
export type AccessKeyAlreadyExistsErrorType = AccessKeyAlreadyExistsError & {
  name: 'AccessKeyAlreadyExistsError'
}

/** Thrown when authorizing an access key that is already authorized. */
export class AccessKeyAlreadyExistsError extends AccessKeyError<
  TempoExecutionError.Decoded<'KeyAlreadyExists'>
> {
  /** Expiry (Unix seconds) of the existing key, when known. */
  expiry: bigint | undefined
  /** Whether the existing key enforces spending limits, when known. */
  limited: boolean | undefined

  constructor(
    parameters: AccessKeyError.Parameters & {
      expiry?: bigint | undefined
      limited?: boolean | undefined
    },
  ) {
    const { expiry, limited } = parameters
    super(parameters, {
      details: {
        expires: formatTime(expiry),
        'spending limits':
          limited === undefined ? undefined : limited ? 'enforced' : 'none',
      },
      name: 'AccessKeyAlreadyExistsError',
      shortMessage: `Access key "${parameters.accessKey}" is already authorized on account "${parameters.account}".`,
    })
    this.expiry = expiry
    this.limited = limited
  }
}

/** `AccessKeySignatureTypeMismatchError` with a literal `name`, for narrowing. */
export type AccessKeySignatureTypeMismatchErrorType =
  AccessKeySignatureTypeMismatchError & {
    name: 'AccessKeySignatureTypeMismatchError'
  }

/** Thrown when an access key signs with a different key type than it was authorized with. */
export class AccessKeySignatureTypeMismatchError extends AccessKeyError<
  TempoExecutionError.Decoded<'SignatureTypeMismatch'>
> {
  /** Key type the access key was authorized with. */
  expected: KeyType | undefined
  /** Key type of the signature. */
  actual: KeyType | undefined

  constructor(parameters: AccessKeyError.Parameters) {
    const [expected, actual] = (
      (parameters.error.args ?? []) as readonly unknown[]
    ).map(
      (type) =>
        signatureTypes[Number(type) as keyof typeof signatureTypes] as
          | KeyType
          | undefined,
    )
    super(parameters, {
      details: { expected, actual },
      name: 'AccessKeySignatureTypeMismatchError',
      shortMessage: `Access key "${parameters.accessKey}" signed with a ${actual ?? 'different'} key, but was authorized as a ${expected ?? 'different'} key.`,
    })
    this.expected = expected
    this.actual = actual
  }
}

/** `AccessKeyExpiryInPastError` with a literal `name`, for narrowing. */
export type AccessKeyExpiryInPastErrorType = AccessKeyExpiryInPastError & {
  name: 'AccessKeyExpiryInPastError'
}

/** Thrown when authorizing an access key with an expiry that has passed or is too soon. */
export class AccessKeyExpiryInPastError extends AccessKeyError<
  TempoExecutionError.Decoded<'ExpiryInPast'>
> {
  /** Requested expiry (Unix seconds), when known. */
  expiry: bigint | undefined
  /** Earliest allowed expiry (Unix seconds), when known. */
  minimum: bigint | undefined

  constructor(
    parameters: AccessKeyError.Parameters & {
      expiry?: bigint | undefined
      minimum?: bigint | undefined
    },
  ) {
    const { expiry, minimum } = parameters
    super(parameters, {
      details: { expiry: formatTime(expiry), minimum: formatTime(minimum) },
      name: 'AccessKeyExpiryInPastError',
      shortMessage: `Access key "${parameters.accessKey}" expiry must be later${minimum ? ` than ${formatTime(minimum)}` : ''}.`,
    })
    this.expiry = expiry
    this.minimum = minimum
  }
}

type KeyType = (typeof signatureTypes)[keyof typeof signatureTypes]

const keychain = {
  address: Addresses.accountKeychain,
  abi: Abis.accountKeychain,
} as const

/** Signer and key for errors raised while validating the signing access key. */
function getSigner(context: Context) {
  const { call, parameters, signer } = context
  if (!signer?.accessKey) return undefined
  // Key management calls and authorizations of another key fail about that key, not the signer.
  if (call && Address.isEqual(call.address, Addresses.accountKeychain))
    return undefined
  const authorized = parameters.keyAuthorization?.address as
    | Address.Address
    | undefined
  if (authorized && !Address.isEqual(authorized, signer.accessKey))
    return undefined
  return {
    ...context.base,
    account: signer.address,
    accessKey: signer.accessKey,
  }
}

/** Fee payer and key for fee payment errors. External fee payers cannot be resolved. */
function getFeePayer(context: Context) {
  const { feePayer } = context.parameters
  if (typeof feePayer !== 'object' || feePayer === null) return undefined
  const account = viem_Account.from(feePayer)
  if (!('accessKeyAddress' in account) || !account.accessKeyAddress)
    return undefined
  return {
    ...context.base,
    account: account.address,
    accessKey: account.accessKeyAddress as Address.Address,
  }
}

/** Account and key for errors raised while authorizing a key. */
function getAuthorization(context: Context) {
  const { call, parameters, signer } = context
  const accessKey =
    (parameters.keyAuthorization?.address as Address.Address | undefined) ??
    call?.arg<Address.Address>('keyId')
  if (!signer || !accessKey) return undefined
  return { ...context.base, account: signer.address, accessKey }
}

/** @internal */
export const errorResolvers: Resolvers = {
  // Fallback for `AccountKeychain` errors without a specific resolver below.
  ...Object.fromEntries(
    Abis.accountKeychain.flatMap((item) =>
      item.type === 'error'
        ? [
            [
              AbiItem.getSignature(item),
              (context: Context) => {
                const parameters = getSigner(context)
                return parameters && new AccessKeyError(parameters)
              },
            ],
          ]
        : [],
    ),
  ),
  'CallNotAllowed()': (context) => {
    const parameters = getSigner(context)
    if (!parameters) return undefined
    return new AccessKeyCallNotAllowedError({
      ...parameters,
      selector: (context.parameters.data as Hex.Hex | undefined)?.slice(
        0,
        10,
      ) as Hex.Hex | undefined,
      target: context.call?.address ?? context.parameters.to,
    })
  },
  'ExpiryInPast()': (context) => {
    const parameters = getAuthorization(context)
    if (!parameters) return undefined
    const [, expiry, minimum] =
      /expiry (\d+) <= min allowed (\d+)/.exec(context.details) ?? []
    const requested =
      context.parameters.keyAuthorization?.expiry ??
      context.call?.arg<bigint>('expiry') ??
      context.call?.arg<{ expiry: bigint }>('config')?.expiry
    return new AccessKeyExpiryInPastError({
      ...parameters,
      expiry: expiry
        ? BigInt(expiry)
        : requested === undefined || requested === null
          ? undefined
          : BigInt(requested),
      minimum: minimum ? BigInt(minimum) : undefined,
    })
  },
  'KeyAlreadyExists()': async (context) => {
    const parameters = getAuthorization(context)
    if (!parameters) return undefined
    const key = await context.read({
      ...keychain,
      functionName: 'getKey',
      args: [parameters.account, parameters.accessKey],
    })
    return new AccessKeyAlreadyExistsError({
      ...parameters,
      expiry: key?.expiry,
      limited: key?.enforceLimits,
    })
  },
  'KeyExpired()': async (context) => {
    const parameters = getSigner(context)
    if (!parameters) return undefined
    const key = await context.read({
      ...keychain,
      functionName: 'getKey',
      args: [parameters.account, parameters.accessKey],
    })
    return new AccessKeyExpiredError({ ...parameters, expiry: key?.expiry })
  },
  'SignatureTypeMismatch(uint8,uint8)': (context) => {
    const parameters = getSigner(context) ?? getAuthorization(context)
    return parameters && new AccessKeySignatureTypeMismatchError(parameters)
  },
  'SpendingLimitExceeded()': async (context) => {
    // Without revert data, the fee payment exceeded the limit.
    const fee = context.validation
    const parameters =
      fee && context.parameters.feePayer
        ? getFeePayer(context)
        : getSigner(context)
    if (!parameters) return undefined
    const token = fee
      ? getFeeToken(context)
      : isTip20(context.call?.address)
        ? context.call.address
        : undefined
    if (!token)
      return new AccessKeySpendingLimitExceededError({
        ...parameters,
        fee,
        hints: fee
          ? [...parameters.hints, 'Pay fees with another token.']
          : parameters.hints,
      })
    const args = [parameters.account, parameters.accessKey, token] as const
    const [withPeriod, legacy, decimals] = await Promise.all([
      // `getRemainingLimitWithPeriod` is T3+; `getRemainingLimit` covers earlier hardforks.
      context.read({
        ...keychain,
        functionName: 'getRemainingLimitWithPeriod',
        args,
      }),
      context.read({ ...keychain, functionName: 'getRemainingLimit', args }),
      context.read({
        address: token,
        abi: Abis.tip20,
        functionName: 'decimals',
      }),
    ])
    return new AccessKeySpendingLimitExceededError({
      ...parameters,
      amount: fee ? undefined : context.call?.arg<bigint>('amount'),
      decimals,
      fee,
      periodEnd: withPeriod?.periodEnd || undefined,
      remaining: withPeriod?.remaining ?? legacy,
      token,
    })
  },
}
