import * as AbiEvent from 'ox/AbiEvent'
import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'
import type * as Log from 'ox/Log'
import * as TokenId from 'ox/tempo/TokenId'

import type * as Account from '../../core/Account.js'
import type * as Client from '../../core/Client.js'
import { BaseError } from '../../core/Errors.js'
import { read } from '../../core/actions/contract/read.js'
import { write } from '../../core/actions/contract/write.js'
import { writeSync } from '../../core/actions/contract/writeSync.js'
import { watchEvent } from '../../core/actions/contract/watchEvent.js'
import * as Abis from '../Abis.js'
import * as Addresses from '../Addresses.js'
import {
  FeeTokenNotTip20Error,
  FeeTokenNotUsdError,
  FeeTokenPausedError,
  InvalidFeeTokenError,
} from '../errors.js'
import type { ReadParameters, WriteParameters } from '../internal/types.js'
import { defineCall } from '../internal/utils.js'
import * as token from './token.js'

const tip20AddressPrefix = '0x20c0'
const zeroAddress = '0x0000000000000000000000000000000000000000'

/** The awaited return type of a contract write action. @internal */
type ActionReturnType<action extends (...args: never[]) => unknown> = Awaited<
  ReturnType<action>
>

/**
 * Gets the user's default fee token.
 *
 * @example
 * ```ts
 * import { Account, Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromPrivateKey('0x…'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const userToken = await Actions.fee.getUserToken(client)
 * ```
 */
export async function getUserToken(
  client: Client.Client,
  options: getUserToken.Options = {},
): Promise<getUserToken.ReturnType> {
  const { account: account_ = client.account, ...rest } = options
  if (!account_) throw new BaseError('account is required.')
  const account = typeof account_ === 'string' ? account_ : account_.address
  const address = (await read(client, {
    ...rest,
    ...getUserToken.call({ account }),
  } as never)) as Address.Address
  if (address === zeroAddress) return null
  return {
    address,
    id: TokenId.fromAddress(address),
  }
}

export namespace getUserToken {
  export type Args = {
    /** Account address. */
    account: Address.Address
  }

  export type Options = ReadParameters & {
    /** Account (or address) to read the fee token for. @default client.account */
    account?: Account.Account | Address.Address | undefined
  }

  export type ReturnType = {
    address: Address.Address
    id: bigint
  } | null

  export type ErrorType = read.ErrorType | Errors.GlobalErrorType

  /** Defines a call to the `userTokens` function. */
  export function call(args: Args) {
    const { account } = args
    return defineCall({
      abi: Abis.feeManager,
      address: Addresses.feeManager,
      args: [account],
      functionName: 'userTokens',
    } as never)
  }
}

/**
 * Gets a validator's preferred fee token.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const validatorToken = await Actions.fee.getValidatorToken(client, {
 *   validator: '0x…',
 * })
 * ```
 */
export async function getValidatorToken(
  client: Client.Client,
  options: getValidatorToken.Options,
): Promise<getValidatorToken.ReturnType> {
  const { validator, ...rest } = options
  const address = (await read(client, {
    ...rest,
    ...getValidatorToken.call({ validator }),
  } as never)) as Address.Address
  if (address === zeroAddress) return null
  return {
    address,
    id: TokenId.fromAddress(address),
  }
}

export namespace getValidatorToken {
  export type Args = {
    /** Validator address. */
    validator: Address.Address
  }

  export type Options = ReadParameters & Args

  export type ReturnType = {
    address: Address.Address
    id: bigint
  } | null

  export type ErrorType = read.ErrorType | Errors.GlobalErrorType

  /** Defines a call to the `validatorTokens` function. */
  export function call(args: Args) {
    const { validator } = args
    return defineCall({
      abi: Abis.feeManager,
      address: Addresses.feeManager,
      args: [validator],
      functionName: 'validatorTokens',
    } as never)
  }
}

/**
 * Sets the user's default fee token.
 *
 * @example
 * ```ts
 * import { Account, Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromPrivateKey('0x…'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const hash = await Actions.fee.setUserToken(client, { token: 1n })
 * ```
 */
export async function setUserToken(
  client: Client.Client,
  options: setUserToken.Options,
): Promise<setUserToken.ReturnType> {
  return await setUserToken.inner(write, client, options)
}

export namespace setUserToken {
  export type Args = {
    /** Address or ID of the TIP-20 token. */
    token: TokenId.TokenIdOrAddress
  }

  export type Options = WriteParameters & Args

  export type ReturnType = write.ReturnType

  export type ErrorType = write.ErrorType | Errors.GlobalErrorType

  /** @internal */
  export async function inner<action extends typeof write | typeof writeSync>(
    action: action,
    client: Client.Client,
    options: setUserToken.Options,
  ): Promise<ActionReturnType<action>> {
    const { token, ...rest } = options
    return (await action(client, {
      ...rest,
      ...setUserToken.call({ token }),
    } as never)) as never
  }

  /** Defines a call to the `setUserToken` function. */
  export function call(args: Args) {
    const { token } = args
    return defineCall({
      abi: Abis.feeManager,
      address: Addresses.feeManager,
      args: [TokenId.toAddress(token)],
      functionName: 'setUserToken',
    } as never)
  }

  /** Extracts the `UserTokenSet` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.feeManager, logs, {
      eventName: 'UserTokenSet',
      strict: true,
    })
    if (!log) throw new BaseError('`UserTokenSet` event not found.')
    return log
  }
}

/**
 * Sets the user's default fee token and waits for the transaction to be
 * confirmed.
 *
 * @example
 * ```ts
 * import { Account, Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromPrivateKey('0x…'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const { token, receipt } = await Actions.fee.setUserTokenSync(client, {
 *   token: 1n,
 * })
 * ```
 */
export async function setUserTokenSync(
  client: Client.Client,
  options: setUserTokenSync.Options,
): Promise<setUserTokenSync.ReturnType> {
  const { throwOnReceiptRevert = true, ...rest } = options
  const receipt = await setUserToken.inner(writeSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = setUserToken.extractEvent(receipt.logs)
  return {
    ...(args as Record<string, unknown>),
    receipt,
  } as setUserTokenSync.ReturnType
}

export declare namespace setUserTokenSync {
  type Args = setUserToken.Args

  type Options = setUserToken.Options

  type ReturnType = {
    /** Account whose fee token was set. */
    user: Address.Address
    /** The fee token set. */
    token: Address.Address
    /** Transaction receipt. */
    receipt: writeSync.ReturnType
  }

  type ErrorType = writeSync.ErrorType | Errors.GlobalErrorType
}

/**
 * Sets the validator's preferred fee token.
 *
 * @example
 * ```ts
 * import { Account, Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromPrivateKey('0x…'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const hash = await Actions.fee.setValidatorToken(client, { token: 1n })
 * ```
 */
export async function setValidatorToken(
  client: Client.Client,
  options: setValidatorToken.Options,
): Promise<setValidatorToken.ReturnType> {
  return await setValidatorToken.inner(write, client, options)
}

export namespace setValidatorToken {
  export type Args = {
    /** Address or ID of the TIP-20 token. */
    token: TokenId.TokenIdOrAddress
  }

  export type Options = WriteParameters & Args

  export type ReturnType = write.ReturnType

  export type ErrorType = write.ErrorType | Errors.GlobalErrorType

  /** @internal */
  export async function inner<action extends typeof write | typeof writeSync>(
    action: action,
    client: Client.Client,
    options: setValidatorToken.Options,
  ): Promise<ActionReturnType<action>> {
    const { token, ...rest } = options
    return (await action(client, {
      ...rest,
      ...setValidatorToken.call({ token }),
    } as never)) as never
  }

  /** Defines a call to the `setValidatorToken` function. */
  export function call(args: Args) {
    const { token } = args
    return defineCall({
      abi: Abis.feeManager,
      address: Addresses.feeManager,
      args: [TokenId.toAddress(token)],
      functionName: 'setValidatorToken',
    } as never)
  }

  /** Extracts the `ValidatorTokenSet` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.feeManager, logs, {
      eventName: 'ValidatorTokenSet',
      strict: true,
    })
    if (!log) throw new BaseError('`ValidatorTokenSet` event not found.')
    return log
  }
}

/**
 * Sets the validator's preferred fee token and waits for the transaction to
 * be confirmed.
 *
 * @example
 * ```ts
 * import { Account, Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromPrivateKey('0x…'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const { token, receipt } = await Actions.fee.setValidatorTokenSync(client, {
 *   token: 1n,
 * })
 * ```
 */
export async function setValidatorTokenSync(
  client: Client.Client,
  options: setValidatorTokenSync.Options,
): Promise<setValidatorTokenSync.ReturnType> {
  const { throwOnReceiptRevert = true, ...rest } = options
  const receipt = await setValidatorToken.inner(writeSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = setValidatorToken.extractEvent(receipt.logs)
  return {
    ...(args as Record<string, unknown>),
    receipt,
  } as setValidatorTokenSync.ReturnType
}

export declare namespace setValidatorTokenSync {
  type Args = setValidatorToken.Args

  type Options = setValidatorToken.Options

  type ReturnType = {
    /** Validator whose fee token was set. */
    validator: Address.Address
    /** The fee token set. */
    token: Address.Address
    /** Transaction receipt. */
    receipt: writeSync.ReturnType
  }

  type ErrorType = writeSync.ErrorType | Errors.GlobalErrorType
}

/**
 * Validates that a token can be used as a Tempo fee token.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const { address, metadata } = await Actions.fee.validateToken(client, {
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 */
export async function validateToken(
  client: Client.Client,
  options: validateToken.Options,
): Promise<validateToken.ReturnType> {
  const { token: token_, ...rest } = options
  const address = (() => {
    try {
      return TokenId.toAddress(token_)
    } catch (cause) {
      throw new InvalidFeeTokenError({
        cause: cause as BaseError | Error,
        token: String(token_),
      })
    }
  })()

  if (!address.toLowerCase().startsWith(tip20AddressPrefix))
    throw new FeeTokenNotTip20Error({ token: address })

  const isPathUsd = address.toLowerCase() === Addresses.pathUsd.toLowerCase()
  if (!isPathUsd) {
    const isTip20 = await read(client, {
      ...rest,
      abi: Abis.tip20Factory,
      address: Addresses.tip20Factory,
      args: [address],
      functionName: 'isTIP20',
    } as never).catch((cause) => {
      throw new InvalidFeeTokenError({
        cause: cause as BaseError | Error,
        token: address,
      })
    })
    if (!isTip20) throw new FeeTokenNotTip20Error({ token: address })
  }

  const metadata = await token
    .getMetadata(client, { ...rest, token: address } as never)
    .catch((cause: unknown) => {
      throw new InvalidFeeTokenError({
        cause: cause as BaseError | Error,
        token: address,
      })
    })

  if (metadata.currency !== 'USD')
    throw new FeeTokenNotUsdError({
      currency: metadata.currency,
      token: address,
    })
  if (metadata.paused === true)
    throw new FeeTokenPausedError({ token: address })

  return {
    address,
    id: TokenId.fromAddress(address),
    metadata,
  }
}

export declare namespace validateToken {
  type Options = ReadParameters & {
    /** Address or ID of the TIP-20 token. */
    token: TokenId.TokenIdOrAddress
  }

  type ReturnType = {
    address: Address.Address
    id: bigint
    metadata: token.getMetadata.ReturnType
  }

  type ErrorType =
    | FeeTokenNotTip20Error
    | FeeTokenNotUsdError
    | FeeTokenPausedError
    | InvalidFeeTokenError
    | Errors.GlobalErrorType
}

/**
 * Watches for user fee-token updates, returning a watcher handle.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const watcher = Actions.fee.watchSetUserToken(client)
 * watcher.onLogs((logs) => console.log(logs))
 * // later: watcher.off()
 * ```
 */
export function watchSetUserToken(
  client: Client.Client,
  options: watchSetUserToken.Options = {},
): watchSetUserToken.ReturnType {
  return watchEvent(client, {
    ...options,
    abi: Abis.feeManager,
    address: Addresses.feeManager,
    eventName: 'UserTokenSet',
    strict: true,
  } as never) as watchSetUserToken.ReturnType
}

export declare namespace watchSetUserToken {
  type Options = Omit<
    watchEvent.Options,
    'abi' | 'address' | 'eventName' | 'strict'
  >

  type ReturnType = watchEvent.Watcher<
    typeof Abis.feeManager,
    'UserTokenSet',
    true
  >

  type ErrorType = watchEvent.ErrorType | Errors.GlobalErrorType
}

/**
 * Watches for validator fee-token updates, returning a watcher handle.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const watcher = Actions.fee.watchSetValidatorToken(client)
 * watcher.onLogs((logs) => console.log(logs))
 * // later: watcher.off()
 * ```
 */
export function watchSetValidatorToken(
  client: Client.Client,
  options: watchSetValidatorToken.Options = {},
): watchSetValidatorToken.ReturnType {
  return watchEvent(client, {
    ...options,
    abi: Abis.feeManager,
    address: Addresses.feeManager,
    eventName: 'ValidatorTokenSet',
    strict: true,
  } as never) as watchSetValidatorToken.ReturnType
}

export declare namespace watchSetValidatorToken {
  type Options = Omit<
    watchEvent.Options,
    'abi' | 'address' | 'eventName' | 'strict'
  >

  type ReturnType = watchEvent.Watcher<
    typeof Abis.feeManager,
    'ValidatorTokenSet',
    true
  >

  type ErrorType = watchEvent.ErrorType | Errors.GlobalErrorType
}
