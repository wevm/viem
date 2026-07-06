import * as AbiEvent from 'ox/AbiEvent'
import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'
import * as Hash from 'ox/Hash'
import * as Hex from 'ox/Hex'
import type * as Log from 'ox/Log'
import type * as TokenId from 'ox/tempo/TokenId'

import * as Account from '../../core/Account.js'
import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'
import { BaseError } from '../../core/Errors.js'
import { read } from '../../core/actions/contract/read.js'
import { watchEvent } from '../../core/actions/contract/watchEvent.js'
import { write } from '../../core/actions/contract/write.js'
import { writeSync } from '../../core/actions/contract/writeSync.js'
import * as Abis from '../Abis.js'
import * as Addresses from '../Addresses.js'
import type { ReadParameters, WriteParameters } from '../internal/types.js'
import { defineCall, resolveToken } from '../internal/utils.js'

/** The awaited return type of a contract write action. @internal */
type ActionReturnType<action extends (...args: never[]) => unknown> = Awaited<
  ReturnType<action>
>

/** Order type for limit orders. */
type OrderType = 'buy' | 'sell'

/** Computes the orderbook key for a base/quote pair. @internal */
function getPairKey(base: Address.Address, quote: Address.Address) {
  return Hash.keccak256(Hex.concat(base, quote))
}

/**
 * Buys a specific amount of tokens.
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
 * const hash = await Actions.dex.buy(client, {
 *   amountOut: 100n,
 *   maxAmountIn: 105n,
 *   tokenIn: '0x…',
 *   tokenOut: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function buy<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: buy.Options,
): Promise<buy.ReturnType> {
  return buy.inner(write, client, options)
}

export namespace buy {
  export type Args = {
    /** Amount of `tokenOut` to buy. */
    amountOut: bigint
    /** Maximum amount of `tokenIn` to spend. */
    maxAmountIn: bigint
    /** Address or ID of the token to spend. */
    tokenIn: TokenId.TokenIdOrAddress
    /** Address or ID of the token to buy. */
    tokenOut: TokenId.TokenIdOrAddress
  }

  export type Options = WriteParameters & Args

  export type ReturnType = write.ReturnType

  export type ErrorType = write.ErrorType | Errors.GlobalErrorType

  /** @internal */
  export async function inner<action extends typeof write | typeof writeSync>(
    action: action,
    client: Client.Client,
    options: buy.Options,
  ): Promise<ActionReturnType<action>> {
    const { amountOut, maxAmountIn, tokenIn, tokenOut, ...rest } = options
    return (await action(client, {
      ...rest,
      ...buy.call(client, { amountOut, maxAmountIn, tokenIn, tokenOut }),
    } as never)) as never
  }

  /**
   * Defines a call to the `swapExactAmountOut` function. Can be passed to any
   * action that accepts a contract call.
   *
   * @param client - Client.
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(client: Client.Client, args: Args) {
    const { amountOut, maxAmountIn, tokenIn, tokenOut } = args
    return defineCall({
      abi: Abis.stablecoinDex,
      address: Addresses.stablecoinDex,
      args: [
        resolveToken(client, { token: tokenIn }).address,
        resolveToken(client, { token: tokenOut }).address,
        amountOut,
        maxAmountIn,
      ],
      functionName: 'swapExactAmountOut',
    } as never)
  }
}

/**
 * Buys a specific amount of tokens, and waits for the transaction to be
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
 * const { receipt } = await Actions.dex.buySync(client, {
 *   amountOut: 100n,
 *   maxAmountIn: 105n,
 *   tokenIn: '0x…',
 *   tokenOut: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt.
 */
export async function buySync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: buySync.Options,
): Promise<buySync.ReturnType<chain>> {
  const { throwOnReceiptRevert = true, ...rest } = options
  const receipt = await buy.inner(writeSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  return { receipt } as never
}

export declare namespace buySync {
  type Args = buy.Args

  type Options = buy.Options

  type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** Transaction receipt. */
    receipt: writeSync.ReturnType<chain>
  }

  type ErrorType = writeSync.ErrorType | Errors.GlobalErrorType
}

/**
 * Cancels an order from the orderbook.
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
 * const hash = await Actions.dex.cancel(client, { orderId: 123n })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function cancel<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: cancel.Options,
): Promise<cancel.ReturnType> {
  return cancel.inner(write, client, options)
}

export namespace cancel {
  export type Args = {
    /** Order ID to cancel. */
    orderId: bigint
  }

  export type Options = WriteParameters & Args

  export type ReturnType = write.ReturnType

  export type ErrorType = write.ErrorType | Errors.GlobalErrorType

  /** @internal */
  export async function inner<action extends typeof write | typeof writeSync>(
    action: action,
    client: Client.Client,
    options: cancel.Options,
  ): Promise<ActionReturnType<action>> {
    const { orderId, ...rest } = options
    return (await action(client, {
      ...rest,
      ...cancel.call({ orderId }),
    } as never)) as never
  }

  /**
   * Defines a call to the `cancel` function. Can be passed to any action that
   * accepts a contract call.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { orderId } = args
    return defineCall({
      abi: Abis.stablecoinDex,
      address: Addresses.stablecoinDex,
      args: [orderId],
      functionName: 'cancel',
    } as never)
  }

  /** Extracts the `OrderCancelled` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.stablecoinDex, logs, {
      eventName: 'OrderCancelled',
      strict: true,
    })
    if (!log) throw new BaseError('`OrderCancelled` event not found.')
    return log
  }
}

/**
 * Cancels a stale order from the orderbook.
 *
 * A stale order is one where the owner's balance or allowance has dropped
 * below the order amount.
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
 * const hash = await Actions.dex.cancelStale(client, { orderId: 123n })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function cancelStale<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: cancelStale.Options,
): Promise<cancelStale.ReturnType> {
  return cancelStale.inner(write, client, options)
}

export namespace cancelStale {
  export type Args = {
    /** Order ID to cancel. */
    orderId: bigint
  }

  export type Options = WriteParameters & Args

  export type ReturnType = write.ReturnType

  export type ErrorType = write.ErrorType | Errors.GlobalErrorType

  /** @internal */
  export async function inner<action extends typeof write | typeof writeSync>(
    action: action,
    client: Client.Client,
    options: cancelStale.Options,
  ): Promise<ActionReturnType<action>> {
    const { orderId, ...rest } = options
    return (await action(client, {
      ...rest,
      ...cancelStale.call({ orderId }),
    } as never)) as never
  }

  /**
   * Defines a call to the `cancelStaleOrder` function. Can be passed to any
   * action that accepts a contract call.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { orderId } = args
    return defineCall({
      abi: Abis.stablecoinDex,
      address: Addresses.stablecoinDex,
      args: [orderId],
      functionName: 'cancelStaleOrder',
    } as never)
  }

  /** Extracts the `OrderCancelled` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.stablecoinDex, logs, {
      eventName: 'OrderCancelled',
      strict: true,
    })
    if (!log) throw new BaseError('`OrderCancelled` event not found.')
    return log
  }
}

/**
 * Cancels a stale order from the orderbook, and waits for the transaction to
 * be confirmed.
 *
 * A stale order is one where the owner's balance or allowance has dropped
 * below the order amount.
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
 * const { receipt, ...event } = await Actions.dex.cancelStaleSync(client, {
 *   orderId: 123n,
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function cancelStaleSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: cancelStaleSync.Options,
): Promise<cancelStaleSync.ReturnType<chain>> {
  const { throwOnReceiptRevert = true, ...rest } = options
  const receipt = await cancelStale.inner(writeSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = cancelStale.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export declare namespace cancelStaleSync {
  type Args = cancelStale.Args

  type Options = cancelStale.Options

  type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** Order ID of the cancelled order. */
    orderId: bigint
    /** Transaction receipt. */
    receipt: writeSync.ReturnType<chain>
  }

  type ErrorType = writeSync.ErrorType | Errors.GlobalErrorType
}

/**
 * Cancels an order from the orderbook, and waits for the transaction to be
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
 * const { receipt, ...event } = await Actions.dex.cancelSync(client, {
 *   orderId: 123n,
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function cancelSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: cancelSync.Options,
): Promise<cancelSync.ReturnType<chain>> {
  const { throwOnReceiptRevert = true, ...rest } = options
  const receipt = await cancel.inner(writeSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = cancel.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export declare namespace cancelSync {
  type Args = cancel.Args

  type Options = cancel.Options

  type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** Order ID of the cancelled order. */
    orderId: bigint
    /** Transaction receipt. */
    receipt: writeSync.ReturnType<chain>
  }

  type ErrorType = writeSync.ErrorType | Errors.GlobalErrorType
}

/**
 * Creates a new trading pair on the DEX.
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
 * const hash = await Actions.dex.createPair(client, { base: '0x…' })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function createPair<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: createPair.Options,
): Promise<createPair.ReturnType> {
  return createPair.inner(write, client, options)
}

export namespace createPair {
  export type Args = {
    /** Address or ID of the base token for the pair. */
    base: TokenId.TokenIdOrAddress
  }

  export type Options = WriteParameters & Args

  export type ReturnType = write.ReturnType

  export type ErrorType = write.ErrorType | Errors.GlobalErrorType

  /** @internal */
  export async function inner<action extends typeof write | typeof writeSync>(
    action: action,
    client: Client.Client,
    options: createPair.Options,
  ): Promise<ActionReturnType<action>> {
    const { base, ...rest } = options
    return (await action(client, {
      ...rest,
      ...createPair.call(client, { base }),
    } as never)) as never
  }

  /**
   * Defines a call to the `createPair` function. Can be passed to any action
   * that accepts a contract call.
   *
   * @param client - Client.
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(client: Client.Client, args: Args) {
    const { base } = args
    return defineCall({
      abi: Abis.stablecoinDex,
      address: Addresses.stablecoinDex,
      args: [resolveToken(client, { token: base }).address],
      functionName: 'createPair',
    } as never)
  }

  /** Extracts the `PairCreated` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.stablecoinDex, logs, {
      eventName: 'PairCreated',
      strict: true,
    })
    if (!log) throw new BaseError('`PairCreated` event not found.')
    return log
  }
}

/**
 * Creates a new trading pair on the DEX, and waits for the transaction to be
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
 * const { receipt, ...event } = await Actions.dex.createPairSync(client, {
 *   base: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function createPairSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: createPairSync.Options,
): Promise<createPairSync.ReturnType<chain>> {
  const { throwOnReceiptRevert = true, ...rest } = options
  const receipt = await createPair.inner(writeSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = createPair.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export declare namespace createPairSync {
  type Args = createPair.Args

  type Options = createPair.Options

  type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** Orderbook pair key. */
    key: Hex.Hex
    /** Base token address. */
    base: Address.Address
    /** Quote token address. */
    quote: Address.Address
    /** Transaction receipt. */
    receipt: writeSync.ReturnType<chain>
  }

  type ErrorType = writeSync.ErrorType | Errors.GlobalErrorType
}

/**
 * Gets a user's token balance on the DEX.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const balance = await Actions.dex.getBalance(client, {
 *   account: '0x…',
 *   token: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The user's token balance on the DEX.
 */
export async function getBalance<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: getBalance.Options,
): Promise<getBalance.ReturnType> {
  const { account: account_ = client.account, token, ...rest } = options
  if (!account_) throw new Account.NotFoundError()
  const address = typeof account_ === 'string' ? account_ : account_.address
  return (await read(client, {
    ...rest,
    ...getBalance.call(client, { account: address, token }),
  } as never)) as getBalance.ReturnType
}

export namespace getBalance {
  export type Args = {
    /** Address of the account. */
    account: Address.Address
    /** Address or ID of the token. */
    token: TokenId.TokenIdOrAddress
  }

  export type Options = Omit<ReadParameters, 'account'> &
    Omit<Args, 'account'> & {
      /** Account (or address) to read the balance of. @default client.account */
      account?: Account.Account | Address.Address | undefined
    }

  export type ReturnType = read.ReturnType<
    typeof Abis.stablecoinDex,
    'balanceOf'
  >

  export type ErrorType =
    | Account.NotFoundError
    | read.ErrorType
    | Errors.GlobalErrorType

  /**
   * Defines a call to the `balanceOf` function. Can be passed to any action
   * that accepts a contract call.
   *
   * @param client - Client.
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(client: Client.Client, args: Args) {
    const { account, token } = args
    return defineCall({
      abi: Abis.stablecoinDex,
      address: Addresses.stablecoinDex,
      args: [account, resolveToken(client, { token }).address],
      functionName: 'balanceOf',
    } as never)
  }
}

/**
 * Gets the quote for buying a specific amount of tokens.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const amountIn = await Actions.dex.getBuyQuote(client, {
 *   amountOut: 100n,
 *   tokenIn: '0x…',
 *   tokenOut: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The amount of `tokenIn` needed to buy the specified `amountOut`.
 */
export async function getBuyQuote<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: getBuyQuote.Options,
): Promise<getBuyQuote.ReturnType> {
  const { amountOut, tokenIn, tokenOut, ...rest } = options
  return (await read(client, {
    ...rest,
    ...getBuyQuote.call(client, { amountOut, tokenIn, tokenOut }),
  } as never)) as getBuyQuote.ReturnType
}

export namespace getBuyQuote {
  export type Args = {
    /** Amount of `tokenOut` to buy. */
    amountOut: bigint
    /** Address or ID of the token to spend. */
    tokenIn: TokenId.TokenIdOrAddress
    /** Address or ID of the token to buy. */
    tokenOut: TokenId.TokenIdOrAddress
  }

  export type Options = ReadParameters & Args

  export type ReturnType = read.ReturnType<
    typeof Abis.stablecoinDex,
    'quoteSwapExactAmountOut'
  >

  export type ErrorType = read.ErrorType | Errors.GlobalErrorType

  /**
   * Defines a call to the `quoteSwapExactAmountOut` function. Can be passed to
   * any action that accepts a contract call.
   *
   * @param client - Client.
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(client: Client.Client, args: Args) {
    const { amountOut, tokenIn, tokenOut } = args
    return defineCall({
      abi: Abis.stablecoinDex,
      address: Addresses.stablecoinDex,
      args: [
        resolveToken(client, { token: tokenIn }).address,
        resolveToken(client, { token: tokenOut }).address,
        amountOut,
      ],
      functionName: 'quoteSwapExactAmountOut',
    } as never)
  }
}

/**
 * Gets an order's details from the orderbook.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const order = await Actions.dex.getOrder(client, { orderId: 123n })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The order details.
 */
export async function getOrder<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: getOrder.Options,
): Promise<getOrder.ReturnType> {
  const { orderId, ...rest } = options
  return (await read(client, {
    ...rest,
    ...getOrder.call({ orderId }),
  } as never)) as getOrder.ReturnType
}

export namespace getOrder {
  export type Args = {
    /** Order ID to query. */
    orderId: bigint
  }

  export type Options = ReadParameters & Args

  export type ReturnType = read.ReturnType<
    typeof Abis.stablecoinDex,
    'getOrder'
  >

  export type ErrorType = read.ErrorType | Errors.GlobalErrorType

  /**
   * Defines a call to the `getOrder` function. Can be passed to any action
   * that accepts a contract call.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { orderId } = args
    return defineCall({
      abi: Abis.stablecoinDex,
      address: Addresses.stablecoinDex,
      args: [orderId],
      functionName: 'getOrder',
    } as never)
  }
}

/**
 * Gets orderbook information for a trading pair.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const book = await Actions.dex.getOrderbook(client, {
 *   base: '0x…',
 *   quote: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The orderbook information.
 */
export async function getOrderbook<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: getOrderbook.Options,
): Promise<getOrderbook.ReturnType> {
  const { base, quote, ...rest } = options
  return (await read(client, {
    ...rest,
    ...getOrderbook.call(client, { base, quote }),
  } as never)) as getOrderbook.ReturnType
}

export namespace getOrderbook {
  export type Args = {
    /** Address or ID of the base token. */
    base: TokenId.TokenIdOrAddress
    /** Address or ID of the quote token. */
    quote: TokenId.TokenIdOrAddress
  }

  export type Options = ReadParameters & Args

  export type ReturnType = read.ReturnType<typeof Abis.stablecoinDex, 'books'>

  export type ErrorType = read.ErrorType | Errors.GlobalErrorType

  /**
   * Defines a call to the `books` function. Can be passed to any action that
   * accepts a contract call.
   *
   * @param client - Client.
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(client: Client.Client, args: Args) {
    const { base, quote } = args
    const pairKey = getPairKey(
      resolveToken(client, { token: base }).address,
      resolveToken(client, { token: quote }).address,
    )
    return defineCall({
      abi: Abis.stablecoinDex,
      address: Addresses.stablecoinDex,
      args: [pairKey],
      functionName: 'books',
    } as never)
  }
}

/**
 * Gets the quote for selling a specific amount of tokens.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const amountOut = await Actions.dex.getSellQuote(client, {
 *   amountIn: 100n,
 *   tokenIn: '0x…',
 *   tokenOut: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The amount of `tokenOut` received for selling the specified `amountIn`.
 */
export async function getSellQuote<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: getSellQuote.Options,
): Promise<getSellQuote.ReturnType> {
  const { amountIn, tokenIn, tokenOut, ...rest } = options
  return (await read(client, {
    ...rest,
    ...getSellQuote.call(client, { amountIn, tokenIn, tokenOut }),
  } as never)) as getSellQuote.ReturnType
}

export namespace getSellQuote {
  export type Args = {
    /** Amount of `tokenIn` to sell. */
    amountIn: bigint
    /** Address or ID of the token to sell. */
    tokenIn: TokenId.TokenIdOrAddress
    /** Address or ID of the token to receive. */
    tokenOut: TokenId.TokenIdOrAddress
  }

  export type Options = ReadParameters & Args

  export type ReturnType = read.ReturnType<
    typeof Abis.stablecoinDex,
    'quoteSwapExactAmountIn'
  >

  export type ErrorType = read.ErrorType | Errors.GlobalErrorType

  /**
   * Defines a call to the `quoteSwapExactAmountIn` function. Can be passed to
   * any action that accepts a contract call.
   *
   * @param client - Client.
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(client: Client.Client, args: Args) {
    const { amountIn, tokenIn, tokenOut } = args
    return defineCall({
      abi: Abis.stablecoinDex,
      address: Addresses.stablecoinDex,
      args: [
        resolveToken(client, { token: tokenIn }).address,
        resolveToken(client, { token: tokenOut }).address,
        amountIn,
      ],
      functionName: 'quoteSwapExactAmountIn',
    } as never)
  }
}

/**
 * Gets the price level information at a specific tick.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const level = await Actions.dex.getTickLevel(client, {
 *   base: '0x…',
 *   isBid: true,
 *   tick: -10,
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The price level information.
 */
export async function getTickLevel<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: getTickLevel.Options,
): Promise<getTickLevel.ReturnType> {
  const { base, isBid, tick, ...rest } = options
  const [head, tail, totalLiquidity] = (await read(client, {
    ...rest,
    ...getTickLevel.call(client, { base, isBid, tick }),
  } as never)) as read.ReturnType<typeof Abis.stablecoinDex, 'getTickLevel'>
  return { head, tail, totalLiquidity }
}

export namespace getTickLevel {
  export type Args = {
    /** Address or ID of the base token. */
    base: TokenId.TokenIdOrAddress
    /** Whether to query the bid side (`true`) or ask side (`false`). */
    isBid: boolean
    /** Price tick to query. */
    tick: number
  }

  export type Options = ReadParameters & Args

  export type ReturnType = {
    /** Order ID of the first order at this tick (0 if empty). */
    head: bigint
    /** Order ID of the last order at this tick (0 if empty). */
    tail: bigint
    /** Total liquidity available at this tick level. */
    totalLiquidity: bigint
  }

  export type ErrorType = read.ErrorType | Errors.GlobalErrorType

  /**
   * Defines a call to the `getTickLevel` function. Can be passed to any action
   * that accepts a contract call.
   *
   * @param client - Client.
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(client: Client.Client, args: Args) {
    const { base, isBid, tick } = args
    return defineCall({
      abi: Abis.stablecoinDex,
      address: Addresses.stablecoinDex,
      args: [resolveToken(client, { token: base }).address, tick, isBid],
      functionName: 'getTickLevel',
    } as never)
  }
}

/**
 * Places a limit order on the orderbook.
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
 * const hash = await Actions.dex.place(client, {
 *   amount: 100n,
 *   tick: -10,
 *   token: '0x…',
 *   type: 'buy',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function place<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: place.Options,
): Promise<place.ReturnType> {
  return place.inner(write, client, options)
}

export namespace place {
  export type Args = {
    /** Amount of tokens to place in the order. */
    amount: bigint
    /** Price tick for the order. */
    tick: number
    /** Address or ID of the base token. */
    token: TokenId.TokenIdOrAddress
    /** Order type: `buy` to buy the token, `sell` to sell it. */
    type: OrderType
  }

  export type Options = WriteParameters & Args

  export type ReturnType = write.ReturnType

  export type ErrorType = write.ErrorType | Errors.GlobalErrorType

  /** @internal */
  export async function inner<action extends typeof write | typeof writeSync>(
    action: action,
    client: Client.Client,
    options: place.Options,
  ): Promise<ActionReturnType<action>> {
    const { amount, tick, token, type, ...rest } = options
    return (await action(client, {
      ...rest,
      ...place.call(client, { amount, tick, token, type }),
    } as never)) as never
  }

  /**
   * Defines a call to the `place` function. Can be passed to any action that
   * accepts a contract call.
   *
   * @param client - Client.
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(client: Client.Client, args: Args) {
    const { amount, tick, token, type } = args
    const isBid = type === 'buy'
    return defineCall({
      abi: Abis.stablecoinDex,
      address: Addresses.stablecoinDex,
      args: [resolveToken(client, { token }).address, amount, isBid, tick],
      functionName: 'place',
    } as never)
  }

  /** Extracts the `OrderPlaced` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.stablecoinDex, logs, {
      eventName: 'OrderPlaced',
      strict: true,
    })
    if (!log) throw new BaseError('`OrderPlaced` event not found.')
    return log
  }
}

/**
 * Places a flip order that automatically flips when filled.
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
 * const hash = await Actions.dex.placeFlip(client, {
 *   amount: 100n,
 *   flipTick: 10,
 *   tick: -10,
 *   token: '0x…',
 *   type: 'buy',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function placeFlip<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: placeFlip.Options,
): Promise<placeFlip.ReturnType> {
  return placeFlip.inner(write, client, options)
}

export namespace placeFlip {
  export type Args = {
    /** Amount of tokens to place in the order. */
    amount: bigint
    /** Target tick to flip to when the order is filled. */
    flipTick: number
    /** Price tick for the order. */
    tick: number
    /** Address or ID of the base token. */
    token: TokenId.TokenIdOrAddress
    /** Order type: `buy` to buy the token, `sell` to sell it. */
    type: OrderType
  }

  export type Options = WriteParameters & Args

  export type ReturnType = write.ReturnType

  export type ErrorType = write.ErrorType | Errors.GlobalErrorType

  /** @internal */
  export async function inner<action extends typeof write | typeof writeSync>(
    action: action,
    client: Client.Client,
    options: placeFlip.Options,
  ): Promise<ActionReturnType<action>> {
    const { amount, flipTick, tick, token, type, ...rest } = options
    return (await action(client, {
      ...rest,
      ...placeFlip.call(client, { amount, flipTick, tick, token, type }),
    } as never)) as never
  }

  /**
   * Defines a call to the `placeFlip` function. Can be passed to any action
   * that accepts a contract call.
   *
   * @param client - Client.
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(client: Client.Client, args: Args) {
    const { amount, flipTick, tick, token, type } = args
    const isBid = type === 'buy'
    return defineCall({
      abi: Abis.stablecoinDex,
      address: Addresses.stablecoinDex,
      args: [
        resolveToken(client, { token }).address,
        amount,
        isBid,
        tick,
        flipTick,
      ],
      functionName: 'placeFlip',
    } as never)
  }

  /** Extracts the `OrderPlaced` event (with `isFlipOrder: true`) from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const events = AbiEvent.extractLogs(Abis.stablecoinDex, logs, {
      eventName: 'OrderPlaced',
      strict: true,
    })
    const log = events.find((event) => event.args.isFlipOrder)
    if (!log) throw new BaseError('`OrderPlaced` event (flip order) not found.')
    return log
  }
}

/**
 * Places a flip order that automatically flips when filled, and waits for the
 * transaction to be confirmed.
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
 * const { receipt, ...event } = await Actions.dex.placeFlipSync(client, {
 *   amount: 100n,
 *   flipTick: 10,
 *   tick: -10,
 *   token: '0x…',
 *   type: 'buy',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function placeFlipSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: placeFlipSync.Options,
): Promise<placeFlipSync.ReturnType<chain>> {
  const { throwOnReceiptRevert = true, ...rest } = options
  const receipt = await placeFlip.inner(writeSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = placeFlip.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export declare namespace placeFlipSync {
  type Args = placeFlip.Args

  type Options = placeFlip.Options

  type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** Order ID of the placed order. */
    orderId: bigint
    /** Address of the order maker. */
    maker: Address.Address
    /** Address of the base token. */
    token: Address.Address
    /** Amount of tokens placed in the order. */
    amount: bigint
    /** Whether the order is a bid (buy). */
    isBid: boolean
    /** Price tick of the order. */
    tick: number
    /** Whether the order is a flip order. */
    isFlipOrder: boolean
    /** Target tick to flip to when the order is filled. */
    flipTick: number
    /** Transaction receipt. */
    receipt: writeSync.ReturnType<chain>
  }

  type ErrorType = writeSync.ErrorType | Errors.GlobalErrorType
}

/**
 * Places a limit order on the orderbook, and waits for the transaction to be
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
 * const { receipt, ...event } = await Actions.dex.placeSync(client, {
 *   amount: 100n,
 *   tick: -10,
 *   token: '0x…',
 *   type: 'buy',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function placeSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: placeSync.Options,
): Promise<placeSync.ReturnType<chain>> {
  const { throwOnReceiptRevert = true, ...rest } = options
  const receipt = await place.inner(writeSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = place.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export declare namespace placeSync {
  type Args = place.Args

  type Options = place.Options

  type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** Order ID of the placed order. */
    orderId: bigint
    /** Address of the order maker. */
    maker: Address.Address
    /** Address of the base token. */
    token: Address.Address
    /** Amount of tokens placed in the order. */
    amount: bigint
    /** Whether the order is a bid (buy). */
    isBid: boolean
    /** Price tick of the order. */
    tick: number
    /** Whether the order is a flip order. */
    isFlipOrder: boolean
    /** Target tick to flip to when the order is filled. */
    flipTick: number
    /** Transaction receipt. */
    receipt: writeSync.ReturnType<chain>
  }

  type ErrorType = writeSync.ErrorType | Errors.GlobalErrorType
}

/**
 * Sells a specific amount of tokens.
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
 * const hash = await Actions.dex.sell(client, {
 *   amountIn: 100n,
 *   minAmountOut: 95n,
 *   tokenIn: '0x…',
 *   tokenOut: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function sell<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: sell.Options,
): Promise<sell.ReturnType> {
  return sell.inner(write, client, options)
}

export namespace sell {
  export type Args = {
    /** Amount of `tokenIn` to sell. */
    amountIn: bigint
    /** Minimum amount of `tokenOut` to receive. */
    minAmountOut: bigint
    /** Address or ID of the token to sell. */
    tokenIn: TokenId.TokenIdOrAddress
    /** Address or ID of the token to receive. */
    tokenOut: TokenId.TokenIdOrAddress
  }

  export type Options = WriteParameters & Args

  export type ReturnType = write.ReturnType

  export type ErrorType = write.ErrorType | Errors.GlobalErrorType

  /** @internal */
  export async function inner<action extends typeof write | typeof writeSync>(
    action: action,
    client: Client.Client,
    options: sell.Options,
  ): Promise<ActionReturnType<action>> {
    const { amountIn, minAmountOut, tokenIn, tokenOut, ...rest } = options
    return (await action(client, {
      ...rest,
      ...sell.call(client, { amountIn, minAmountOut, tokenIn, tokenOut }),
    } as never)) as never
  }

  /**
   * Defines a call to the `swapExactAmountIn` function. Can be passed to any
   * action that accepts a contract call.
   *
   * @param client - Client.
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(client: Client.Client, args: Args) {
    const { amountIn, minAmountOut, tokenIn, tokenOut } = args
    return defineCall({
      abi: Abis.stablecoinDex,
      address: Addresses.stablecoinDex,
      args: [
        resolveToken(client, { token: tokenIn }).address,
        resolveToken(client, { token: tokenOut }).address,
        amountIn,
        minAmountOut,
      ],
      functionName: 'swapExactAmountIn',
    } as never)
  }
}

/**
 * Sells a specific amount of tokens, and waits for the transaction to be
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
 * const { receipt } = await Actions.dex.sellSync(client, {
 *   amountIn: 100n,
 *   minAmountOut: 95n,
 *   tokenIn: '0x…',
 *   tokenOut: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt.
 */
export async function sellSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: sellSync.Options,
): Promise<sellSync.ReturnType<chain>> {
  const { throwOnReceiptRevert = true, ...rest } = options
  const receipt = await sell.inner(writeSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  return { receipt } as never
}

export declare namespace sellSync {
  type Args = sell.Args

  type Options = sell.Options

  type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** Transaction receipt. */
    receipt: writeSync.ReturnType<chain>
  }

  type ErrorType = writeSync.ErrorType | Errors.GlobalErrorType
}

/**
 * Watches for flip order placed events, returning a watcher handle.
 *
 * Emits only `OrderPlaced` logs with `isFlipOrder` set.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const watcher = Actions.dex.watchFlipOrderPlaced(client)
 * watcher.onLogs((logs) => console.log(logs))
 * // later: watcher.off()
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The watcher handle.
 */
export function watchFlipOrderPlaced(
  client: Client.Client,
  options: watchFlipOrderPlaced.Options = {},
): watchFlipOrderPlaced.ReturnType {
  const watcher = watchEvent(client, {
    ...options,
    abi: Abis.stablecoinDex,
    address: Addresses.stablecoinDex,
    eventName: 'OrderPlaced',
    strict: true,
  } as never) as watchFlipOrderPlaced.ReturnType
  return {
    ...watcher,
    onLogs(fn) {
      return watcher.onLogs((logs) => {
        const flipLogs = logs.filter((log) => log.args.isFlipOrder)
        if (flipLogs.length > 0) fn(flipLogs)
      })
    },
    async *[Symbol.asyncIterator]() {
      for await (const { logs } of watcher) {
        const flipLogs = logs.filter((log) => log.args.isFlipOrder)
        if (flipLogs.length > 0) yield { logs: flipLogs }
      }
    },
  }
}

export declare namespace watchFlipOrderPlaced {
  type Options = Omit<
    watchEvent.Options,
    'abi' | 'address' | 'eventName' | 'strict'
  >

  type ReturnType = watchEvent.Watcher<
    typeof Abis.stablecoinDex,
    'OrderPlaced',
    true
  >

  type ErrorType = watchEvent.ErrorType | Errors.GlobalErrorType
}

/**
 * Watches for order cancelled events, returning a watcher handle.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const watcher = Actions.dex.watchOrderCancelled(client)
 * watcher.onLogs((logs) => console.log(logs))
 * // later: watcher.off()
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The watcher handle.
 */
export function watchOrderCancelled(
  client: Client.Client,
  options: watchOrderCancelled.Options = {},
): watchOrderCancelled.ReturnType {
  return watchEvent(client, {
    ...options,
    abi: Abis.stablecoinDex,
    address: Addresses.stablecoinDex,
    eventName: 'OrderCancelled',
    strict: true,
  } as never) as watchOrderCancelled.ReturnType
}

export declare namespace watchOrderCancelled {
  type Options = Omit<
    watchEvent.Options,
    'abi' | 'address' | 'eventName' | 'strict'
  >

  type ReturnType = watchEvent.Watcher<
    typeof Abis.stablecoinDex,
    'OrderCancelled',
    true
  >

  type ErrorType = watchEvent.ErrorType | Errors.GlobalErrorType
}

/**
 * Watches for order filled events, returning a watcher handle.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const watcher = Actions.dex.watchOrderFilled(client)
 * watcher.onLogs((logs) => console.log(logs))
 * // later: watcher.off()
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The watcher handle.
 */
export function watchOrderFilled(
  client: Client.Client,
  options: watchOrderFilled.Options = {},
): watchOrderFilled.ReturnType {
  return watchEvent(client, {
    ...options,
    abi: Abis.stablecoinDex,
    address: Addresses.stablecoinDex,
    eventName: 'OrderFilled',
    strict: true,
  } as never) as watchOrderFilled.ReturnType
}

export declare namespace watchOrderFilled {
  type Options = Omit<
    watchEvent.Options,
    'abi' | 'address' | 'eventName' | 'strict'
  >

  type ReturnType = watchEvent.Watcher<
    typeof Abis.stablecoinDex,
    'OrderFilled',
    true
  >

  type ErrorType = watchEvent.ErrorType | Errors.GlobalErrorType
}

/**
 * Watches for order placed events, returning a watcher handle.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const watcher = Actions.dex.watchOrderPlaced(client)
 * watcher.onLogs((logs) => console.log(logs))
 * // later: watcher.off()
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The watcher handle.
 */
export function watchOrderPlaced(
  client: Client.Client,
  options: watchOrderPlaced.Options = {},
): watchOrderPlaced.ReturnType {
  return watchEvent(client, {
    ...options,
    abi: Abis.stablecoinDex,
    address: Addresses.stablecoinDex,
    eventName: 'OrderPlaced',
    strict: true,
  } as never) as watchOrderPlaced.ReturnType
}

export declare namespace watchOrderPlaced {
  type Options = Omit<
    watchEvent.Options,
    'abi' | 'address' | 'eventName' | 'strict'
  >

  type ReturnType = watchEvent.Watcher<
    typeof Abis.stablecoinDex,
    'OrderPlaced',
    true
  >

  type ErrorType = watchEvent.ErrorType | Errors.GlobalErrorType
}

/**
 * Withdraws tokens from the DEX to the caller's wallet.
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
 * const hash = await Actions.dex.withdraw(client, {
 *   amount: 100n,
 *   token: '0x…',
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
    /** Amount to withdraw. */
    amount: bigint
    /** Address or ID of the token to withdraw. */
    token: TokenId.TokenIdOrAddress
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
    const { amount, token, ...rest } = options
    return (await action(client, {
      ...rest,
      ...withdraw.call(client, { amount, token }),
    } as never)) as never
  }

  /**
   * Defines a call to the `withdraw` function. Can be passed to any action
   * that accepts a contract call.
   *
   * @param client - Client.
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(client: Client.Client, args: Args) {
    const { amount, token } = args
    return defineCall({
      abi: Abis.stablecoinDex,
      address: Addresses.stablecoinDex,
      args: [resolveToken(client, { token }).address, amount],
      functionName: 'withdraw',
    } as never)
  }
}

/**
 * Withdraws tokens from the DEX to the caller's wallet, and waits for the
 * transaction to be confirmed.
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
 * const { receipt } = await Actions.dex.withdrawSync(client, {
 *   amount: 100n,
 *   token: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt.
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
  return { receipt } as never
}

export declare namespace withdrawSync {
  type Args = withdraw.Args

  type Options = withdraw.Options

  type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** Transaction receipt. */
    receipt: writeSync.ReturnType<chain>
  }

  type ErrorType = writeSync.ErrorType | Errors.GlobalErrorType
}
