import * as AbiEvent from 'ox/AbiEvent'
import * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'
import * as Hex from 'ox/Hex'
import type * as Log from 'ox/Log'
import * as Channel from 'ox/tempo/Channel'
import type * as TokenId from 'ox/tempo/TokenId'

import * as Account from '../../core/Account.js'
import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'
import { BaseError } from '../../core/Errors.js'
import { read } from '../../core/actions/contract/read.js'
import { write } from '../../core/actions/contract/write.js'
import { writeSync } from '../../core/actions/contract/writeSync.js'
import * as Abis from '../Abis.js'
import type { ReadParameters, WriteParameters } from '../internal/types.js'
import { defineCall, resolveToken } from '../internal/utils.js'

const zeroAddress = '0x0000000000000000000000000000000000000000'

/** The awaited return type of a contract write action. @internal */
type ActionReturnType<action extends (...args: never[]) => unknown> = Awaited<
  ReturnType<action>
>

/**
 * Closes a TIP-20 channel reserve channel from the payee or operator side.
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
 * const hash = await Actions.channel.close(client, {
 *   captureAmount: 100n,
 *   channel,
 *   cumulativeAmount: 100n,
 *   signature: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function close<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: close.Options,
): Promise<close.ReturnType> {
  return close.inner(write, client, options)
}

export namespace close {
  export type Args = {
    /** Amount to capture for the payee during close. */
    captureAmount: bigint
    /** TIP-20 channel. */
    channel: Channel.from.Value
    /** Total voucher amount signed for the channel. */
    cumulativeAmount: bigint
    /** Voucher signature. */
    signature: Hex.Hex
  }

  export type Options = WriteParameters & Args

  export type ReturnType = write.ReturnType

  export type ErrorType = write.ErrorType | Errors.GlobalErrorType

  /** @internal */
  export async function inner<action extends typeof write | typeof writeSync>(
    action: action,
    client: Client.Client,
    options: close.Options,
  ): Promise<ActionReturnType<action>> {
    const { captureAmount, channel, cumulativeAmount, signature, ...rest } =
      options
    return (await action(client, {
      ...rest,
      ...close.call({ captureAmount, channel, cumulativeAmount, signature }),
    } as never)) as never
  }

  /**
   * Defines a call to the `close` function. Can be passed to any action that
   * accepts a contract call.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { captureAmount, channel, cumulativeAmount, signature } = args
    return defineCall({
      abi: Abis.tip20ChannelReserve,
      address: Channel.address,
      args: [Channel.from(channel), cumulativeAmount, captureAmount, signature],
      functionName: 'close',
    })
  }

  /** Extracts the `ChannelClosed` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.tip20ChannelReserve, logs, {
      eventName: 'ChannelClosed',
      strict: true,
    })
    if (!log) throw new BaseError('`ChannelClosed` event not found.')
    return log
  }
}

/**
 * Closes a TIP-20 channel reserve channel and waits for the transaction
 * receipt.
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
 * const { receipt, ...event } = await Actions.channel.closeSync(client, {
 *   captureAmount: 100n,
 *   channel,
 *   cumulativeAmount: 100n,
 *   signature: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function closeSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: closeSync.Options,
): Promise<closeSync.ReturnType<chain>> {
  const { throwOnReceiptRevert = true, ...rest } = options
  const receipt = await close.inner(writeSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = close.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export declare namespace closeSync {
  type Args = close.Args

  type Options = close.Options

  type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** Channel ID. */
    channelId: Hex.Hex
    /** Account that funded the channel and receives refunds. */
    payer: Address.Address
    /** Account that receives settled voucher payments. */
    payee: Address.Address
    /** Amount settled to the payee at close. */
    settledToPayee: bigint
    /** Amount refunded to the payer at close. */
    refundedToPayer: bigint
    /** Transaction receipt. */
    receipt: writeSync.ReturnType<chain>
  }

  type ErrorType = writeSync.ErrorType | Errors.GlobalErrorType
}

/**
 * Gets TIP-20 channel reserve state for a channel ID or channel.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const state = await Actions.channel.getStates(client, {
 *   channel: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns Channel state for a single channel, or channel states for multiple channels.
 */
export async function getStates<
  chain extends Chain.Chain | undefined,
  const channel extends getStates.Channel | readonly getStates.Channel[],
>(
  client: Client.Client<chain>,
  options: getStates.Options<channel>,
): Promise<getStates.ReturnType<channel>> {
  const { channel, ...rest } = options
  return (await read(client, {
    ...rest,
    ...getStates.call({ chainId: client.chain?.id, channel } as never),
  } as never)) as never
}

export namespace getStates {
  export type Args<
    channel extends Channel | readonly Channel[] = Channel | readonly Channel[],
  > = {
    /**
     * Chain ID used to compute IDs for channel inputs.
     *
     * Required for channel inputs when using `getStates.call` directly.
     */
    chainId?: number | undefined
    /** Channel ID, channel, or list of IDs and channels. */
    channel: channel
  }

  export type Channel = Hex.Hex | Channel.from.Value

  export type Options<
    channel extends Channel | readonly Channel[] = Channel | readonly Channel[],
  > = ReadParameters & {
    /** Channel ID, channel, or list of IDs and channels. */
    channel: channel
  }

  export type State = read.ReturnType<
    typeof Abis.tip20ChannelReserve,
    'getChannelState'
  >

  export type ReturnType<channel extends Channel | readonly Channel[]> =
    channel extends readonly Channel[] ? readonly State[] : State

  export type ErrorType = read.ErrorType | Errors.GlobalErrorType

  /**
   * Defines a call to the `getChannelState` or `getChannelStatesBatch`
   * function. Can be passed to any action that accepts a contract call.
   * `chainId` is required to compute IDs for channel inputs.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call<const channel extends Channel | readonly Channel[]>(
    args: Args<channel>,
  ) {
    const { chainId, channel } = args
    if (Array.isArray(channel)) {
      const channelIds = (channel as readonly Channel[]).map((channel) => {
        if (typeof channel === 'string') return channel
        if (chainId === undefined)
          throw new BaseError('`chainId` is required for channel inputs.')
        return Channel.computeId(channel, { chainId })
      })

      return defineCall({
        abi: Abis.tip20ChannelReserve,
        address: Channel.address,
        args: [channelIds],
        functionName: 'getChannelStatesBatch',
      })
    }

    const channel_ = channel as Channel
    if (typeof channel_ === 'string')
      return defineCall({
        abi: Abis.tip20ChannelReserve,
        address: Channel.address,
        args: [channel_],
        functionName: 'getChannelState',
      })

    if (chainId === undefined)
      throw new BaseError('`chainId` is required for channel inputs.')

    return defineCall({
      abi: Abis.tip20ChannelReserve,
      address: Channel.address,
      args: [Channel.computeId(channel_, { chainId })],
      functionName: 'getChannelState',
    })
  }
}

/**
 * Opens and funds a TIP-20 channel reserve channel.
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
 * const hash = await Actions.channel.open(client, {
 *   deposit: 100n,
 *   payee: '0x…',
 *   token: 1n,
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function open<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: open.Options,
): Promise<open.ReturnType> {
  return open.inner(write, client, options)
}

export namespace open {
  export type Args = {
    /** Optional signer for vouchers. Zero means `payer` signs. @default zero address */
    authorizedSigner?: Address.Address | undefined
    /** Amount of TIP-20 token to deposit. */
    deposit: bigint
    /** Optional relayer allowed to submit `settle` for the payee. @default zero address */
    operator?: Address.Address | undefined
    /** Account that receives settled voucher payments. */
    payee: Address.Address
    /** User-supplied salt to distinguish otherwise identical channels. @default Hex.random(32) */
    salt?: Hex.Hex | undefined
    /** TIP-20 token address or ID held by the channel. */
    token: TokenId.TokenIdOrAddress
  }

  export type Options = WriteParameters & Args

  export type ReturnType = write.ReturnType

  export type ErrorType = write.ErrorType | Errors.GlobalErrorType

  /** @internal */
  export async function inner<action extends typeof write | typeof writeSync>(
    action: action,
    client: Client.Client,
    options: open.Options,
  ): Promise<ActionReturnType<action>> {
    const { authorizedSigner, deposit, operator, payee, salt, token, ...rest } =
      options
    return (await action(client, {
      ...rest,
      ...open.call(client, {
        authorizedSigner,
        deposit,
        operator,
        payee,
        salt,
        token,
      }),
    } as never)) as never
  }

  /**
   * Defines a call to the `open` function. Can be passed to any action that
   * accepts a contract call.
   *
   * @param client - Client.
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(client: Client.Client, args: Args) {
    const {
      authorizedSigner = zeroAddress,
      deposit,
      operator = zeroAddress,
      payee,
      salt = Hex.random(32),
      token,
    } = args
    return defineCall({
      abi: Abis.tip20ChannelReserve,
      address: Channel.address,
      args: [
        Address.from(payee),
        Address.from(operator),
        resolveToken(client, { token }).address,
        deposit,
        salt,
        Address.from(authorizedSigner),
      ],
      functionName: 'open',
    })
  }

  /** Extracts the `ChannelOpened` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.tip20ChannelReserve, logs, {
      eventName: 'ChannelOpened',
      strict: true,
    })
    if (!log) throw new BaseError('`ChannelOpened` event not found.')
    return log
  }
}

/**
 * Opens and funds a TIP-20 channel reserve channel and waits for the
 * transaction receipt.
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
 * const { receipt, ...event } = await Actions.channel.openSync(client, {
 *   deposit: 100n,
 *   payee: '0x…',
 *   token: 1n,
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function openSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: openSync.Options,
): Promise<openSync.ReturnType<chain>> {
  const { throwOnReceiptRevert = true, ...rest } = options
  const receipt = await open.inner(writeSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = open.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export declare namespace openSync {
  type Args = open.Args

  type Options = open.Options

  type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** Channel ID. */
    channelId: Hex.Hex
    /** Account that funded the channel and receives refunds. */
    payer: Address.Address
    /** Account that receives settled voucher payments. */
    payee: Address.Address
    /** Optional relayer allowed to submit `settle` for the payee. */
    operator: Address.Address
    /** TIP-20 token address held by the channel. */
    token: Address.Address
    /** Optional signer for vouchers. Zero means `payer` signs. */
    authorizedSigner: Address.Address
    /** User-supplied salt to distinguish otherwise identical channels. */
    salt: Hex.Hex
    /** Transaction-derived hash assigned when the channel was opened. */
    expiringNonceHash: Hex.Hex
    /** Deposit locked in the channel. */
    deposit: bigint
    /** Transaction receipt. */
    receipt: writeSync.ReturnType<chain>
  }

  type ErrorType = writeSync.ErrorType | Errors.GlobalErrorType
}

/**
 * Starts the payer close timer for a TIP-20 channel reserve channel.
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
 * const hash = await Actions.channel.requestClose(client, {
 *   channel,
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function requestClose<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: requestClose.Options,
): Promise<requestClose.ReturnType> {
  return requestClose.inner(write, client, options)
}

export namespace requestClose {
  export type Args = {
    /** TIP-20 channel. */
    channel: Channel.from.Value
  }

  export type Options = WriteParameters & Args

  export type ReturnType = write.ReturnType

  export type ErrorType = write.ErrorType | Errors.GlobalErrorType

  /** @internal */
  export async function inner<action extends typeof write | typeof writeSync>(
    action: action,
    client: Client.Client,
    options: requestClose.Options,
  ): Promise<ActionReturnType<action>> {
    const { channel, ...rest } = options
    return (await action(client, {
      ...rest,
      ...requestClose.call({ channel }),
    } as never)) as never
  }

  /**
   * Defines a call to the `requestClose` function. Can be passed to any action
   * that accepts a contract call.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { channel } = args
    return defineCall({
      abi: Abis.tip20ChannelReserve,
      address: Channel.address,
      args: [Channel.from(channel)],
      functionName: 'requestClose',
    })
  }

  /** Extracts the `CloseRequested` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.tip20ChannelReserve, logs, {
      eventName: 'CloseRequested',
      strict: true,
    })
    if (!log) throw new BaseError('`CloseRequested` event not found.')
    return log
  }
}

/**
 * Starts the payer close timer and waits for the transaction receipt.
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
 * const { receipt, ...event } = await Actions.channel.requestCloseSync(
 *   client,
 *   { channel },
 * )
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function requestCloseSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: requestCloseSync.Options,
): Promise<requestCloseSync.ReturnType<chain>> {
  const { throwOnReceiptRevert = true, ...rest } = options
  const receipt = await requestClose.inner(writeSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = requestClose.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export declare namespace requestCloseSync {
  type Args = requestClose.Args

  type Options = requestClose.Options

  type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** Channel ID. */
    channelId: Hex.Hex
    /** Account that funded the channel and receives refunds. */
    payer: Address.Address
    /** Account that receives settled voucher payments. */
    payee: Address.Address
    /** Timestamp at which the close grace period ends. */
    closeGraceEnd: bigint
    /** Transaction receipt. */
    receipt: writeSync.ReturnType<chain>
  }

  type ErrorType = writeSync.ErrorType | Errors.GlobalErrorType
}

/**
 * Settles a TIP-20 channel reserve voucher.
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
 * const hash = await Actions.channel.settle(client, {
 *   channel,
 *   cumulativeAmount: 100n,
 *   signature: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function settle<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: settle.Options,
): Promise<settle.ReturnType> {
  return settle.inner(write, client, options)
}

export namespace settle {
  export type Args = {
    /** TIP-20 channel. */
    channel: Channel.from.Value
    /** Total voucher amount signed for the channel. */
    cumulativeAmount: bigint
    /** Voucher signature. */
    signature: Hex.Hex
  }

  export type Options = WriteParameters & Args

  export type ReturnType = write.ReturnType

  export type ErrorType = write.ErrorType | Errors.GlobalErrorType

  /** @internal */
  export async function inner<action extends typeof write | typeof writeSync>(
    action: action,
    client: Client.Client,
    options: settle.Options,
  ): Promise<ActionReturnType<action>> {
    const { channel, cumulativeAmount, signature, ...rest } = options
    return (await action(client, {
      ...rest,
      ...settle.call({ channel, cumulativeAmount, signature }),
    } as never)) as never
  }

  /**
   * Defines a call to the `settle` function. Can be passed to any action that
   * accepts a contract call.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { channel, cumulativeAmount, signature } = args
    return defineCall({
      abi: Abis.tip20ChannelReserve,
      address: Channel.address,
      args: [Channel.from(channel), cumulativeAmount, signature],
      functionName: 'settle',
    })
  }

  /** Extracts the `Settled` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.tip20ChannelReserve, logs, {
      eventName: 'Settled',
      strict: true,
    })
    if (!log) throw new BaseError('`Settled` event not found.')
    return log
  }
}

/**
 * Settles a TIP-20 channel reserve voucher and waits for the transaction
 * receipt.
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
 * const { receipt, ...event } = await Actions.channel.settleSync(client, {
 *   channel,
 *   cumulativeAmount: 100n,
 *   signature: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function settleSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: settleSync.Options,
): Promise<settleSync.ReturnType<chain>> {
  const { throwOnReceiptRevert = true, ...rest } = options
  const receipt = await settle.inner(writeSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = settle.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export declare namespace settleSync {
  type Args = settle.Args

  type Options = settle.Options

  type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** Channel ID. */
    channelId: Hex.Hex
    /** Account that funded the channel and receives refunds. */
    payer: Address.Address
    /** Account that receives settled voucher payments. */
    payee: Address.Address
    /** Total voucher amount signed for the channel. */
    cumulativeAmount: bigint
    /** Amount paid to the payee in this settlement. */
    deltaPaid: bigint
    /** Total amount settled after this settlement. */
    newSettled: bigint
    /** Transaction receipt. */
    receipt: writeSync.ReturnType<chain>
  }

  type ErrorType = writeSync.ErrorType | Errors.GlobalErrorType
}

/**
 * Signs a TIP-20 channel reserve voucher.
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
 * const signature = await Actions.channel.signVoucher(client, {
 *   channel,
 *   cumulativeAmount: 100n,
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The voucher signature.
 */
export async function signVoucher<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: signVoucher.Options<account>,
): Promise<signVoucher.ReturnType> {
  const {
    account: account_ = client.account,
    chainId = client.chain?.id,
    channel,
    cumulativeAmount,
  } = options as signVoucher.Options
  if (!account_) throw new Account.NotFoundError()
  if (chainId === undefined) throw new BaseError('chainId is required.')

  const account =
    typeof account_ === 'string' ? Account.from(account_) : account_
  if (!('sign' in account) || !account.sign)
    throw new BaseError('account.sign is required.')

  const channelId =
    typeof channel === 'string'
      ? channel
      : Channel.computeId(channel, { chainId })
  const hash = Channel.getVoucherSignPayload({
    chainId,
    channelId,
    cumulativeAmount,
  })
  // TODO: access-key raw signing
  return account.sign({ hash })
}

export declare namespace signVoucher {
  type Args = {
    /** Channel ID or channel. */
    channel: getStates.Channel
    /** The chain ID. @default client.chain.id */
    chainId?: number | bigint | undefined
    /** Total voucher amount signed for the channel. */
    cumulativeAmount: bigint
  }

  type Options<
    account extends Account.Account | undefined = Account.Account | undefined,
  > = Args &
    (account extends Account.Account
      ? {
          /** Account (or address) to sign with. @default client.account */
          account?: Account.Account | Address.Address | undefined
        }
      : {
          /** Account (or address) to sign with. */
          account: Account.Account | Address.Address
        })

  type ReturnType = Hex.Hex

  type ErrorType =
    | Account.NotFoundError
    | Channel.computeId.ErrorType
    | Channel.getVoucherSignPayload.ErrorType
    | Errors.GlobalErrorType
}

/**
 * Adds deposit to a TIP-20 channel reserve channel.
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
 * const hash = await Actions.channel.topUp(client, {
 *   additionalDeposit: 100n,
 *   channel,
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function topUp<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: topUp.Options,
): Promise<topUp.ReturnType> {
  return topUp.inner(write, client, options)
}

export namespace topUp {
  export type Args = {
    /** Additional deposit to lock in the channel. */
    additionalDeposit: bigint
    /** TIP-20 channel. */
    channel: Channel.from.Value
  }

  export type Options = WriteParameters & Args

  export type ReturnType = write.ReturnType

  export type ErrorType = write.ErrorType | Errors.GlobalErrorType

  /** @internal */
  export async function inner<action extends typeof write | typeof writeSync>(
    action: action,
    client: Client.Client,
    options: topUp.Options,
  ): Promise<ActionReturnType<action>> {
    const { additionalDeposit, channel, ...rest } = options
    return (await action(client, {
      ...rest,
      ...topUp.call({ additionalDeposit, channel }),
    } as never)) as never
  }

  /**
   * Defines a call to the `topUp` function. Can be passed to any action that
   * accepts a contract call.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { additionalDeposit, channel } = args
    return defineCall({
      abi: Abis.tip20ChannelReserve,
      address: Channel.address,
      args: [Channel.from(channel), additionalDeposit],
      functionName: 'topUp',
    })
  }

  /** Extracts the `TopUp` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.tip20ChannelReserve, logs, {
      eventName: 'TopUp',
      strict: true,
    })
    if (!log) throw new BaseError('`TopUp` event not found.')
    return log
  }
}

/**
 * Adds deposit to a TIP-20 channel reserve channel and waits for the
 * transaction receipt.
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
 * const { receipt, ...event } = await Actions.channel.topUpSync(client, {
 *   additionalDeposit: 100n,
 *   channel,
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function topUpSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: topUpSync.Options,
): Promise<topUpSync.ReturnType<chain>> {
  const { throwOnReceiptRevert = true, ...rest } = options
  const receipt = await topUp.inner(writeSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = topUp.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export declare namespace topUpSync {
  type Args = topUp.Args

  type Options = topUp.Options

  type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** Channel ID. */
    channelId: Hex.Hex
    /** Account that funded the channel and receives refunds. */
    payer: Address.Address
    /** Account that receives settled voucher payments. */
    payee: Address.Address
    /** Additional deposit locked in the channel. */
    additionalDeposit: bigint
    /** Total deposit after the top up. */
    newDeposit: bigint
    /** Transaction receipt. */
    receipt: writeSync.ReturnType<chain>
  }

  type ErrorType = writeSync.ErrorType | Errors.GlobalErrorType
}

/**
 * Withdraws payer funds after the close grace period elapses.
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
 * const hash = await Actions.channel.withdraw(client, {
 *   channel,
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function withdraw<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: withdraw.Options,
): Promise<withdraw.ReturnType> {
  return withdraw.inner(write, client, options)
}

export namespace withdraw {
  export type Args = {
    /** TIP-20 channel. */
    channel: Channel.from.Value
  }

  export type Options = WriteParameters & Args

  export type ReturnType = write.ReturnType

  export type ErrorType = write.ErrorType | Errors.GlobalErrorType

  /** @internal */
  export async function inner<action extends typeof write | typeof writeSync>(
    action: action,
    client: Client.Client,
    options: withdraw.Options,
  ): Promise<ActionReturnType<action>> {
    const { channel, ...rest } = options
    return (await action(client, {
      ...rest,
      ...withdraw.call({ channel }),
    } as never)) as never
  }

  /**
   * Defines a call to the `withdraw` function. Can be passed to any action
   * that accepts a contract call.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { channel } = args
    return defineCall({
      abi: Abis.tip20ChannelReserve,
      address: Channel.address,
      args: [Channel.from(channel)],
      functionName: 'withdraw',
    })
  }

  /** Extracts the `ChannelClosed` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.tip20ChannelReserve, logs, {
      eventName: 'ChannelClosed',
      strict: true,
    })
    if (!log) throw new BaseError('`ChannelClosed` event not found.')
    return log
  }
}

/**
 * Withdraws payer funds after the close grace period elapses and waits for the
 * transaction receipt.
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
 * const { receipt, ...event } = await Actions.channel.withdrawSync(client, {
 *   channel,
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function withdrawSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: withdrawSync.Options,
): Promise<withdrawSync.ReturnType<chain>> {
  const { throwOnReceiptRevert = true, ...rest } = options
  const receipt = await withdraw.inner(writeSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = withdraw.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export declare namespace withdrawSync {
  type Args = withdraw.Args

  type Options = withdraw.Options

  type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** Channel ID. */
    channelId: Hex.Hex
    /** Account that funded the channel and receives refunds. */
    payer: Address.Address
    /** Account that receives settled voucher payments. */
    payee: Address.Address
    /** Amount settled to the payee at close. */
    settledToPayee: bigint
    /** Amount refunded to the payer at close. */
    refundedToPayer: bigint
    /** Transaction receipt. */
    receipt: writeSync.ReturnType<chain>
  }

  type ErrorType = writeSync.ErrorType | Errors.GlobalErrorType
}
