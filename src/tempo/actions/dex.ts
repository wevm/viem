import type { Address } from 'abitype'
import * as Hash from 'ox/Hash'
import * as Hex from 'ox/Hex'
import { parseAccount } from '../../accounts/utils/parseAccount.js'
import {
  type ReadContractReturnType,
  readContract,
} from '../../actions/public/readContract.js'
import {
  type WatchContractEventParameters,
  watchContractEvent,
} from '../../actions/public/watchContractEvent.js'
import {
  type WriteContractReturnType,
  writeContract,
} from '../../actions/wallet/writeContract.js'
import { writeContractSync } from '../../actions/wallet/writeContractSync.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { BaseErrorType } from '../../errors/base.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { ExtractAbiItem, GetEventArgs } from '../../types/contract.js'
import type { Log as viem_Log } from '../../types/log.js'
import type { Compute, UnionOmit } from '../../types/utils.js'
import { parseEventLogs } from '../../utils/abi/parseEventLogs.js'
import { isAddressEqual } from '../../utils/address/isAddressEqual.js'
import * as Abis from '../Abis.js'
import * as Addresses from '../Addresses.js'
import type * as Errors from '../errors.js'
import { TempoExecutionError } from '../errors.js'
import {
  type Context,
  type Resolvers,
  withExecutionError,
} from '../internal/errors.js'
import type {
  GetAccountParameter,
  ReadParameters,
  WriteParameters,
} from '../internal/types.js'
import { defineCall } from '../internal/utils.js'
import type { TransactionReceipt } from '../Transaction.js'

/**
 * Order type for limit orders.
 */
type OrderType = 'buy' | 'sell'

/**
 * Buys a specific amount of tokens.
 *
 * @example
 * ```ts
 * import { createClient, http, parseUnits } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const hash = await Actions.dex.buy(client, {
 *   tokenIn: '0x20c...11',
 *   tokenOut: '0x20c...20',
 *   amountOut: parseUnits('100', 6),
 *   maxAmountIn: parseUnits('105', 6),
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function buy<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: buy.Parameters<chain, account>,
): Promise<buy.ReturnValue> {
  return buy.inner(writeContract, client, parameters)
}

export namespace buy {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** Amount of tokenOut to buy. */
    amountOut: bigint
    /** Maximum amount of tokenIn to spend. */
    maxAmountIn: bigint
    /** Address of the token to spend. */
    tokenIn: Address
    /** Address of the token to buy. */
    tokenOut: Address
  }

  export type ReturnValue = WriteContractReturnType

  // TODO: exhaustive error type
  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType

  /** @internal */
  export async function inner<
    action extends typeof writeContract | typeof writeContractSync,
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    action: action,
    client: Client<Transport, chain, account>,
    parameters: buy.Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const { tokenIn, tokenOut, amountOut, maxAmountIn, ...rest } = parameters
    const call = buy.call({ tokenIn, tokenOut, amountOut, maxAmountIn })
    return (await withExecutionError(action)(client, {
      ...rest,
      ...call,
    } as never)) as never
  }

  /**
   * Defines a call to the `swapExactAmountOut` function.
   *
   * Can be passed as a parameter to:
   * - [`estimateContractGas`](https://viem.sh/docs/contract/estimateContractGas): estimate the gas cost of the call
   * - [`simulateContract`](https://viem.sh/docs/contract/simulateContract): simulate the call
   * - [`sendCalls`](https://viem.sh/docs/actions/wallet/sendCalls): send multiple calls
   *
   * @example
   * ```ts
   * import { createClient, http, parseUnits, walletActions } from 'viem'
   * import { tempo } from 'viem/chains'
   * import { Actions } from 'viem/tempo'
   *
   * const client = createClient({
   *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' })
   *   transport: http(),
   * }).extend(walletActions)
   *
   * const { result } = await client.sendCalls({
   *   calls: [
   *     Actions.dex.buy.call({
   *       tokenIn: '0x20c0...beef',
   *       tokenOut: '0x20c0...babe',
   *       amountOut: parseUnits('100', 6),
   *       maxAmountIn: parseUnits('105', 6),
   *     }),
   *   ]
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { tokenIn, tokenOut, amountOut, maxAmountIn } = args
    return defineCall({
      address: Addresses.stablecoinDex,
      abi: Abis.stablecoinDex,
      functionName: 'swapExactAmountOut',
      args: [tokenIn, tokenOut, amountOut, maxAmountIn],
    })
  }
}

/**
 * Buys a specific amount of tokens.
 *
 * @example
 * ```ts
 * import { createClient, http, parseUnits } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const result = await Actions.dex.buySync(client, {
 *   tokenIn: '0x20c...11',
 *   tokenOut: '0x20c...20',
 *   amountOut: parseUnits('100', 6),
 *   maxAmountIn: parseUnits('105', 6),
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt.
 */
export async function buySync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: buySync.Parameters<chain, account>,
): Promise<buySync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await buy.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  return { receipt }
}

export namespace buySync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = buy.Parameters<chain, account>

  export type Args = buy.Args

  export type ReturnValue = Compute<{
    /** Transaction receipt. */
    receipt: TransactionReceipt
  }>

  // TODO: exhaustive error type
  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType
}

/**
 * Cancels an order from the orderbook.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const hash = await Actions.dex.cancel(client, {
 *   orderId: 123n,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function cancel<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: cancel.Parameters<chain, account>,
): Promise<cancel.ReturnValue> {
  return cancel.inner(writeContract, client, parameters)
}

export namespace cancel {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** Order ID to cancel. */
    orderId: bigint
  }

  export type ReturnValue = WriteContractReturnType

  // TODO: exhaustive error type
  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType

  /** @internal */
  export async function inner<
    action extends typeof writeContract | typeof writeContractSync,
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    action: action,
    client: Client<Transport, chain, account>,
    parameters: cancel.Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const { orderId, ...rest } = parameters
    const call = cancel.call({ orderId })
    return (await withExecutionError(action)(client, {
      ...rest,
      ...call,
    } as never)) as never
  }

  /**
   * Defines a call to the `cancel` function.
   *
   * Can be passed as a parameter to:
   * - [`estimateContractGas`](https://viem.sh/docs/contract/estimateContractGas): estimate the gas cost of the call
   * - [`simulateContract`](https://viem.sh/docs/contract/simulateContract): simulate the call
   * - [`sendCalls`](https://viem.sh/docs/actions/wallet/sendCalls): send multiple calls
   *
   * @example
   * ```ts
   * import { createClient, http, walletActions } from 'viem'
   * import { tempo } from 'viem/chains'
   * import { Actions } from 'viem/tempo'
   *
   * const client = createClient({
   *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' })
   *   transport: http(),
   * }).extend(walletActions)
   *
   * const { result } = await client.sendCalls({
   *   calls: [
   *     Actions.dex.cancel.call({
   *       orderId: 123n,
   *     }),
   *   ]
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { orderId } = args
    return defineCall({
      address: Addresses.stablecoinDex,
      abi: Abis.stablecoinDex,
      functionName: 'cancel',
      args: [orderId],
    })
  }

  /**
   * Extracts the `OrderCancelled` event from logs.
   *
   * @param logs - The logs.
   * @returns The `OrderCancelled` event.
   */
  export function extractEvent(logs: viem_Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.stablecoinDex,
      logs,
      eventName: 'OrderCancelled',
      strict: true,
    })
    if (!log) throw new Error('`OrderCancelled` event not found.')
    return log
  }
}

/**
 * Cancels an order from the orderbook.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const result = await Actions.dex.cancelSync(client, {
 *   orderId: 123n,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function cancelSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: cancelSync.Parameters<chain, account>,
): Promise<cancelSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await cancel.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  if ((receipt as TransactionReceipt).status === 'pending')
    return { receipt } as never
  const { args } = cancel.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export namespace cancelSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = cancel.Parameters<chain, account>

  export type Args = cancel.Args

  export type ReturnValue = Compute<
    GetEventArgs<
      typeof Abis.stablecoinDex,
      'OrderCancelled',
      { IndexedOnly: false; Required: true }
    > & {
      /** Transaction receipt. */
      receipt: TransactionReceipt
    }
  >

  // TODO: exhaustive error type
  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType
}

/**
 * Cancels a stale order from the orderbook.
 *
 * A stale order is one where the owner's balance or allowance has dropped
 * below the order amount.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const hash = await Actions.dex.cancelStale(client, {
 *   orderId: 123n,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function cancelStale<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: cancelStale.Parameters<chain, account>,
): Promise<cancelStale.ReturnValue> {
  return cancelStale.inner(writeContract, client, parameters)
}

export namespace cancelStale {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** Order ID to cancel. */
    orderId: bigint
  }

  export type ReturnValue = WriteContractReturnType

  // TODO: exhaustive error type
  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType

  /** @internal */
  export async function inner<
    action extends typeof writeContract | typeof writeContractSync,
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    action: action,
    client: Client<Transport, chain, account>,
    parameters: cancelStale.Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const { orderId, ...rest } = parameters
    const call = cancelStale.call({ orderId })
    return (await withExecutionError(action)(client, {
      ...rest,
      ...call,
    } as never)) as never
  }

  /**
   * Defines a call to the `cancelStaleOrder` function.
   *
   * Can be passed as a parameter to:
   * - [`estimateContractGas`](https://viem.sh/docs/contract/estimateContractGas): estimate the gas cost of the call
   * - [`simulateContract`](https://viem.sh/docs/contract/simulateContract): simulate the call
   * - [`sendCalls`](https://viem.sh/docs/actions/wallet/sendCalls): send multiple calls
   *
   * @example
   * ```ts
   * import { createClient, http, walletActions } from 'viem'
   * import { tempo } from 'viem/chains'
   * import { Actions } from 'viem/tempo'
   *
   * const client = createClient({
   *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' })
   *   transport: http(),
   * }).extend(walletActions)
   *
   * const { result } = await client.sendCalls({
   *   calls: [
   *     Actions.dex.cancelStale.call({
   *       orderId: 123n,
   *     }),
   *   ]
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { orderId } = args
    return defineCall({
      address: Addresses.stablecoinDex,
      abi: Abis.stablecoinDex,
      functionName: 'cancelStaleOrder',
      args: [orderId],
    })
  }

  /**
   * Extracts the `OrderCancelled` event from logs.
   *
   * @param logs - The logs.
   * @returns The `OrderCancelled` event.
   */
  export function extractEvent(logs: viem_Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.stablecoinDex,
      logs,
      eventName: 'OrderCancelled',
      strict: true,
    })
    if (!log) throw new Error('`OrderCancelled` event not found.')
    return log
  }
}

/**
 * Cancels a stale order from the orderbook and waits for confirmation.
 *
 * A stale order is one where the owner's balance or allowance has dropped
 * below the order amount.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const result = await Actions.dex.cancelStaleSync(client, {
 *   orderId: 123n,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function cancelStaleSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: cancelStaleSync.Parameters<chain, account>,
): Promise<cancelStaleSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await cancelStale.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  if ((receipt as TransactionReceipt).status === 'pending')
    return { receipt } as never
  const { args } = cancelStale.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export namespace cancelStaleSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = cancelStale.Parameters<chain, account>

  export type Args = cancelStale.Args

  export type ReturnValue = Compute<
    GetEventArgs<
      typeof Abis.stablecoinDex,
      'OrderCancelled',
      { IndexedOnly: false; Required: true }
    > & {
      /** Transaction receipt. */
      receipt: TransactionReceipt
    }
  >

  // TODO: exhaustive error type
  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType
}

/**
 * Creates a new trading pair on the DEX.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const hash = await Actions.dex.createPair(client, {
 *   base: '0x20c...11',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function createPair<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: createPair.Parameters<chain, account>,
): Promise<createPair.ReturnValue> {
  return createPair.inner(writeContract, client, parameters)
}

export namespace createPair {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** Address of the base token for the pair. */
    base: Address
  }

  export type ReturnValue = WriteContractReturnType

  // TODO: exhaustive error type
  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType

  /** @internal */
  export async function inner<
    action extends typeof writeContract | typeof writeContractSync,
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    action: action,
    client: Client<Transport, chain, account>,
    parameters: createPair.Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const { base, ...rest } = parameters
    const call = createPair.call({ base })
    return (await withExecutionError(action)(client, {
      ...rest,
      ...call,
    } as never)) as never
  }

  /**
   * Defines a call to the `createPair` function.
   *
   * Can be passed as a parameter to:
   * - [`estimateContractGas`](https://viem.sh/docs/contract/estimateContractGas): estimate the gas cost of the call
   * - [`simulateContract`](https://viem.sh/docs/contract/simulateContract): simulate the call
   * - [`sendCalls`](https://viem.sh/docs/actions/wallet/sendCalls): send multiple calls
   *
   * @example
   * ```ts
   * import { createClient, http, walletActions } from 'viem'
   * import { tempo } from 'viem/chains'
   * import { Actions } from 'viem/tempo'
   *
   * const client = createClient({
   *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' })
   *   transport: http(),
   * }).extend(walletActions)
   *
   * const { result } = await client.sendCalls({
   *   calls: [
   *     Actions.dex.createPair.call({
   *       base: '0x20c0...beef',
   *     }),
   *   ]
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { base } = args
    return defineCall({
      address: Addresses.stablecoinDex,
      abi: Abis.stablecoinDex,
      functionName: 'createPair',
      args: [base],
    })
  }

  /**
   * Extracts the `PairCreated` event from logs.
   *
   * @param logs - The logs.
   * @returns The `PairCreated` event.
   */
  export function extractEvent(logs: viem_Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.stablecoinDex,
      logs,
      eventName: 'PairCreated',
      strict: true,
    })
    if (!log) throw new Error('`PairCreated` event not found.')
    return log
  }
}

/**
 * Creates a new trading pair on the DEX.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const result = await Actions.dex.createPairSync(client, {
 *   base: '0x20c...11',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function createPairSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: createPairSync.Parameters<chain, account>,
): Promise<createPairSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await createPair.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  if ((receipt as TransactionReceipt).status === 'pending')
    return { receipt } as never
  const { args } = createPair.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export namespace createPairSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = createPair.Parameters<chain, account>

  export type Args = createPair.Args

  export type ReturnValue = Compute<
    GetEventArgs<
      typeof Abis.stablecoinDex,
      'PairCreated',
      { IndexedOnly: false; Required: true }
    > & {
      /** Transaction receipt. */
      receipt: TransactionReceipt
    }
  >

  // TODO: exhaustive error type
  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType
}

/**
 * Gets a user's token balance on the DEX.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const balance = await Actions.dex.getBalance(client, {
 *   account: '0x...',
 *   token: '0x20c...11',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The user's token balance on the DEX.
 */
export async function getBalance<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: getBalance.Parameters<account>,
): Promise<getBalance.ReturnValue> {
  const { account: acc = client.account, token, ...rest } = parameters
  const address = acc ? parseAccount(acc).address : undefined
  if (!address) throw new Error('account is required.')
  return withExecutionError(readContract)(client, {
    ...rest,
    ...getBalance.call({ account: address, token }),
  })
}

export namespace getBalance {
  export type Parameters<
    account extends Account | undefined = Account | undefined,
  > = ReadParameters & GetAccountParameter<account> & Args

  export type Args = {
    /** Address of the account. */
    account: Address
    /** Address of the token. */
    token: Address
  }

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.stablecoinDex,
    'balanceOf',
    never
  >

  /**
   * Defines a call to the `balanceOf` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { account, token } = args
    return defineCall({
      address: Addresses.stablecoinDex,
      abi: Abis.stablecoinDex,
      args: [account, token],
      functionName: 'balanceOf',
    })
  }

  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType
}

/**
 * Gets the quote for buying a specific amount of tokens.
 *
 * @example
 * ```ts
 * import { createClient, http, parseUnits } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const amountIn = await Actions.dex.getBuyQuote(client, {
 *   amountOut: parseUnits('100', 6),
 *   tokenIn: '0x20c...11',
 *   tokenOut: '0x20c...20',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The amount of tokenIn needed to buy the specified amountOut.
 */
export async function getBuyQuote<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: getBuyQuote.Parameters,
): Promise<getBuyQuote.ReturnValue> {
  const { tokenIn, tokenOut, amountOut, ...rest } = parameters
  return withExecutionError(readContract)(client, {
    ...rest,
    ...getBuyQuote.call({ tokenIn, tokenOut, amountOut }),
  })
}

export namespace getBuyQuote {
  export type Parameters = ReadParameters & Args

  export type Args = {
    /** Amount of tokenOut to buy. */
    amountOut: bigint
    /** Address of the token to spend. */
    tokenIn: Address
    /** Address of the token to buy. */
    tokenOut: Address
  }

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.stablecoinDex,
    'quoteSwapExactAmountOut',
    never
  >

  /**
   * Defines a call to the `quoteSwapExactAmountOut` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { tokenIn, tokenOut, amountOut } = args
    return defineCall({
      address: Addresses.stablecoinDex,
      abi: Abis.stablecoinDex,
      args: [tokenIn, tokenOut, amountOut],
      functionName: 'quoteSwapExactAmountOut',
    })
  }

  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType
}

/**
 * Gets an order's details from the orderbook.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const order = await Actions.dex.getOrder(client, {
 *   orderId: 123n,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The order details.
 */
export async function getOrder<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: getOrder.Parameters,
): Promise<getOrder.ReturnValue> {
  const { orderId, ...rest } = parameters
  return withExecutionError(readContract)(client, {
    ...rest,
    ...getOrder.call({ orderId }),
  })
}

export namespace getOrder {
  export type Parameters = ReadParameters & Args

  export type Args = {
    /** Order ID to query. */
    orderId: bigint
  }

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.stablecoinDex,
    'getOrder',
    never
  >

  /**
   * Defines a call to the `getOrder` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { orderId } = args
    return defineCall({
      address: Addresses.stablecoinDex,
      abi: Abis.stablecoinDex,
      args: [orderId],
      functionName: 'getOrder',
    })
  }

  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType
}

/**
 * Gets orderbook information for a trading pair.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const book = await Actions.dex.getOrderbook(client, {
 *   base: '0x20c...11',
 *   quote: '0x20c...20',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The orderbook information.
 */
export async function getOrderbook<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: getOrderbook.Parameters,
): Promise<getOrderbook.ReturnValue> {
  const { base, quote, ...rest } = parameters
  return withExecutionError(readContract)(client, {
    ...rest,
    ...getOrderbook.call({ base, quote }),
  })
}

export namespace getOrderbook {
  export type Parameters = ReadParameters & Args

  export type Args = {
    /** Address of the base token. */
    base: Address
    /** Address of the quote token. */
    quote: Address
  }

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.stablecoinDex,
    'books',
    never
  >

  /**
   * Defines a call to the `books` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { base, quote } = args
    const pairKey = getPairKey(base, quote)
    return defineCall({
      address: Addresses.stablecoinDex,
      abi: Abis.stablecoinDex,
      args: [pairKey],
      functionName: 'books',
    })
  }

  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType
}

/**
 * Gets the price level information at a specific tick.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions, Tick } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const level = await Actions.dex.getTickLevel(client, {
 *   base: '0x20c...11',
 *   tick: Tick.fromPrice('1.001'),
 *   isBid: true,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The price level information.
 */
export async function getTickLevel<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: getTickLevel.Parameters,
): Promise<getTickLevel.ReturnValue> {
  const { base, tick, isBid, ...rest } = parameters
  const [head, tail, totalLiquidity] = await withExecutionError(readContract)(
    client,
    {
      ...rest,
      ...getTickLevel.call({ base, tick, isBid }),
    },
  )
  return { head, tail, totalLiquidity }
}

export namespace getTickLevel {
  export type Parameters = ReadParameters & Args

  export type Args = {
    /** Address of the base token. */
    base: Address
    /** Whether to query the bid side (true) or ask side (false). */
    isBid: boolean
    /** Price tick to query. */
    tick: number
  }

  export type ReturnValue = {
    /** Order ID of the first order at this tick (0 if empty) */
    head: bigint
    /** Order ID of the last order at this tick (0 if empty) */
    tail: bigint
    /** Total liquidity available at this tick level */
    totalLiquidity: bigint
  }

  /**
   * Defines a call to the `getTickLevel` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { base, tick, isBid } = args
    return defineCall({
      address: Addresses.stablecoinDex,
      abi: Abis.stablecoinDex,
      args: [base, tick, isBid],
      functionName: 'getTickLevel',
    })
  }

  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType
}

/**
 * Gets the quote for selling a specific amount of tokens.
 *
 * @example
 * ```ts
 * import { createClient, http, parseUnits } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const amountOut = await Actions.dex.getSellQuote(client, {
 *   amountIn: parseUnits('100', 6),
 *   tokenIn: '0x20c...11',
 *   tokenOut: '0x20c...20',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The amount of tokenOut received for selling the specified amountIn.
 */
export async function getSellQuote<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: getSellQuote.Parameters,
): Promise<getSellQuote.ReturnValue> {
  const { tokenIn, tokenOut, amountIn, ...rest } = parameters
  return withExecutionError(readContract)(client, {
    ...rest,
    ...getSellQuote.call({ tokenIn, tokenOut, amountIn }),
  })
}

export namespace getSellQuote {
  export type Parameters = ReadParameters & Args

  export type Args = {
    /** Amount of tokenIn to sell. */
    amountIn: bigint
    /** Address of the token to sell. */
    tokenIn: Address
    /** Address of the token to receive. */
    tokenOut: Address
  }

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.stablecoinDex,
    'quoteSwapExactAmountIn',
    never
  >

  /**
   * Defines a call to the `quoteSwapExactAmountIn` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { tokenIn, tokenOut, amountIn } = args
    return defineCall({
      address: Addresses.stablecoinDex,
      abi: Abis.stablecoinDex,
      args: [tokenIn, tokenOut, amountIn],
      functionName: 'quoteSwapExactAmountIn',
    })
  }

  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType
}

/**
 * Places a limit order on the orderbook.
 *
 * @example
 * ```ts
 * import { createClient, http, parseUnits } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempo } from 'viem/chains'
 * import { Actions, Tick } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const hash = await Actions.dex.place(client, {
 *   amount: parseUnits('100', 6),
 *   tick: Tick.fromPrice('0.99'),
 *   token: '0x20c...11',
 *   type: 'buy',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function place<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: place.Parameters<chain, account>,
): Promise<place.ReturnValue> {
  return place.inner(writeContract, client, parameters)
}

export namespace place {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** Amount of tokens to place in the order. */
    amount: bigint
    /** Price tick for the order. */
    tick: number
    /** Address of the base token. */
    token: Address
    /** Order type - 'buy' to buy the token, 'sell' to sell it. */
    type: OrderType
  }

  export type ReturnValue = WriteContractReturnType

  // TODO: exhaustive error type
  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType

  /** @internal */
  export async function inner<
    action extends typeof writeContract | typeof writeContractSync,
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    action: action,
    client: Client<Transport, chain, account>,
    parameters: place.Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const { amount, token, type, tick, ...rest } = parameters
    const call = place.call({ amount, token, type, tick })
    return (await withExecutionError(action)(client, {
      ...rest,
      ...call,
    } as never)) as never
  }

  /**
   * Defines a call to the `place` function.
   *
   * Can be passed as a parameter to:
   * - [`estimateContractGas`](https://viem.sh/docs/contract/estimateContractGas): estimate the gas cost of the call
   * - [`simulateContract`](https://viem.sh/docs/contract/simulateContract): simulate the call
   * - [`sendCalls`](https://viem.sh/docs/actions/wallet/sendCalls): send multiple calls
   *
   * @example
   * ```ts
   * import { createClient, http, parseUnits, walletActions } from 'viem'
   * import { tempo } from 'viem/chains'
   * import { Actions, Tick } from 'viem/tempo'
   *
   * const client = createClient({
   *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' })
   *   transport: http(),
   * }).extend(walletActions)
   *
   * const { result } = await client.sendCalls({
   *   calls: [
   *     Actions.dex.place.call({
   *       amount: parseUnits('100', 6),
   *       tick: Tick.fromPrice('0.99'),
   *       token: '0x20c0...beef',
   *       type: 'buy',
   *     }),
   *   ]
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { token, amount, type, tick } = args
    const isBid = type === 'buy'
    return defineCall({
      address: Addresses.stablecoinDex,
      abi: Abis.stablecoinDex,
      functionName: 'place',
      args: [token, amount, isBid, tick],
    })
  }

  /**
   * Extracts the `OrderPlaced` event from logs.
   *
   * @param logs - The logs.
   * @returns The `OrderPlaced` event.
   */
  export function extractEvent(logs: viem_Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.stablecoinDex,
      logs,
      eventName: 'OrderPlaced',
      strict: true,
    })
    if (!log) throw new Error('`OrderPlaced` event not found.')
    return log
  }
}

/**
 * Places a flip order that automatically flips when filled.
 *
 * @example
 * ```ts
 * import { createClient, http, parseUnits } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempo } from 'viem/chains'
 * import { Actions, Tick } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const hash = await Actions.dex.placeFlip(client, {
 *   amount: parseUnits('100', 6),
 *   flipTick: Tick.fromPrice('1.01'),
 *   tick: Tick.fromPrice('0.99'),
 *   token: '0x20c...11',
 *   type: 'buy',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function placeFlip<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: placeFlip.Parameters<chain, account>,
): Promise<placeFlip.ReturnValue> {
  return placeFlip.inner(writeContract, client, parameters)
}

export namespace placeFlip {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** Amount of tokens to place in the order. */
    amount: bigint
    /** Target tick to flip to when order is filled. */
    flipTick: number
    /** Price tick for the order. */
    tick: number
    /** Address of the base token. */
    token: Address
    /** Order type - 'buy' to buy the token, 'sell' to sell it. */
    type: OrderType
  }

  export type ReturnValue = WriteContractReturnType

  // TODO: exhaustive error type
  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType

  /** @internal */
  export async function inner<
    action extends typeof writeContract | typeof writeContractSync,
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    action: action,
    client: Client<Transport, chain, account>,
    parameters: placeFlip.Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const { amount, flipTick, tick, token, type, ...rest } = parameters
    const call = placeFlip.call({ amount, flipTick, tick, token, type })
    return (await withExecutionError(action)(client, {
      ...rest,
      ...call,
    } as never)) as never
  }

  /**
   * Defines a call to the `placeFlip` function.
   *
   * Can be passed as a parameter to:
   * - [`estimateContractGas`](https://viem.sh/docs/contract/estimateContractGas): estimate the gas cost of the call
   * - [`simulateContract`](https://viem.sh/docs/contract/simulateContract): simulate the call
   * - [`sendCalls`](https://viem.sh/docs/actions/wallet/sendCalls): send multiple calls
   *
   * @example
   * ```ts
   * import { createClient, http, parseUnits, walletActions } from 'viem'
   * import { tempo } from 'viem/chains'
   * import { Actions, Tick } from 'viem/tempo'
   *
   * const client = createClient({
   *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' })
   *   transport: http(),
   * }).extend(walletActions)
   *
   * const { result } = await client.sendCalls({
   *   calls: [
   *     Actions.dex.placeFlip.call({
   *       amount: parseUnits('100', 6),
   *       flipTick: Tick.fromPrice('1.01'),
   *       tick: Tick.fromPrice('0.99'),
   *       token: '0x20c0...beef',
   *       type: 'buy',
   *     }),
   *   ]
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { token, amount, type, tick, flipTick } = args
    const isBid = type === 'buy'
    return defineCall({
      address: Addresses.stablecoinDex,
      abi: Abis.stablecoinDex,
      functionName: 'placeFlip',
      args: [token, amount, isBid, tick, flipTick],
    })
  }

  /**
   * Extracts the `OrderPlaced` event (with `isFlipOrder: true`) from logs.
   *
   * @param logs - The logs.
   * @returns The `OrderPlaced` event for a flip order.
   */
  export function extractEvent(logs: viem_Log[]) {
    const parsedLogs = parseEventLogs({
      abi: Abis.stablecoinDex,
      logs,
      eventName: 'OrderPlaced',
      strict: true,
    })
    const log = parsedLogs.find((l) => l.args.isFlipOrder)
    if (!log) throw new Error('`OrderPlaced` event (flip order) not found.')
    return log
  }
}

/**
 * Places a flip order that automatically flips when filled.
 *
 * @example
 * ```ts
 * import { createClient, http, parseUnits } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempo } from 'viem/chains'
 * import { Actions, Tick } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const result = await Actions.dex.placeFlipSync(client, {
 *   amount: parseUnits('100', 6),
 *   flipTick: Tick.fromPrice('1.01'),
 *   tick: Tick.fromPrice('0.99'),
 *   token: '0x20c...11',
 *   type: 'buy',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function placeFlipSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: placeFlipSync.Parameters<chain, account>,
): Promise<placeFlipSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await placeFlip.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  if ((receipt as TransactionReceipt).status === 'pending')
    return { receipt } as never
  const { args } = placeFlip.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export namespace placeFlipSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = placeFlip.Parameters<chain, account>

  export type Args = placeFlip.Args

  export type ReturnValue = Compute<
    GetEventArgs<
      typeof Abis.stablecoinDex,
      'OrderPlaced',
      { IndexedOnly: false; Required: true }
    > & {
      /** Transaction receipt. */
      receipt: TransactionReceipt
    }
  >

  // TODO: exhaustive error type
  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType
}

/**
 * Places a limit order on the orderbook.
 *
 * @example
 * ```ts
 * import { createClient, http, parseUnits } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempo } from 'viem/chains'
 * import { Actions, Tick } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const result = await Actions.dex.placeSync(client, {
 *   amount: parseUnits('100', 6),
 *   tick: Tick.fromPrice('0.99'),
 *   token: '0x20c...11',
 *   type: 'buy',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function placeSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: placeSync.Parameters<chain, account>,
): Promise<placeSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await place.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  if ((receipt as TransactionReceipt).status === 'pending')
    return { receipt } as never
  const { args } = place.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export namespace placeSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = place.Parameters<chain, account>

  export type Args = place.Args

  export type ReturnValue = Compute<
    GetEventArgs<
      typeof Abis.stablecoinDex,
      'OrderPlaced',
      { IndexedOnly: false; Required: true }
    > & {
      /** Transaction receipt. */
      receipt: TransactionReceipt
    }
  >

  // TODO: exhaustive error type
  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType
}

/**
 * Sells a specific amount of tokens.
 *
 * @example
 * ```ts
 * import { createClient, http, parseUnits } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const hash = await Actions.dex.sell(client, {
 *   amountIn: parseUnits('100', 6),
 *   minAmountOut: parseUnits('95', 6),
 *   tokenIn: '0x20c...11',
 *   tokenOut: '0x20c...20',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function sell<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: sell.Parameters<chain, account>,
): Promise<sell.ReturnValue> {
  return sell.inner(writeContract, client, parameters)
}

export namespace sell {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** Amount of tokenIn to sell. */
    amountIn: bigint
    /** Minimum amount of tokenOut to receive. */
    minAmountOut: bigint
    /** Address of the token to sell. */
    tokenIn: Address
    /** Address of the token to receive. */
    tokenOut: Address
  }

  export type ReturnValue = WriteContractReturnType

  // TODO: exhaustive error type
  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType

  /** @internal */
  export async function inner<
    action extends typeof writeContract | typeof writeContractSync,
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    action: action,
    client: Client<Transport, chain, account>,
    parameters: sell.Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const { tokenIn, tokenOut, amountIn, minAmountOut, ...rest } = parameters
    const call = sell.call({ tokenIn, tokenOut, amountIn, minAmountOut })
    return (await withExecutionError(action)(client, {
      ...rest,
      ...call,
    } as never)) as never
  }

  /**
   * Defines a call to the `swapExactAmountIn` function.
   *
   * Can be passed as a parameter to:
   * - [`estimateContractGas`](https://viem.sh/docs/contract/estimateContractGas): estimate the gas cost of the call
   * - [`simulateContract`](https://viem.sh/docs/contract/simulateContract): simulate the call
   * - [`sendCalls`](https://viem.sh/docs/actions/wallet/sendCalls): send multiple calls
   *
   * @example
   * ```ts
   * import { createClient, http, parseUnits, walletActions } from 'viem'
   * import { tempo } from 'viem/chains'
   * import { Actions } from 'viem/tempo'
   *
   * const client = createClient({
   *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' })
   *   transport: http(),
   * }).extend(walletActions)
   *
   * const { result } = await client.sendCalls({
   *   calls: [
   *     Actions.dex.sell.call({
   *       amountIn: parseUnits('100', 6),
   *       minAmountOut: parseUnits('95', 6),
   *       tokenIn: '0x20c0...beef',
   *       tokenOut: '0x20c0...babe',
   *     }),
   *   ]
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { tokenIn, tokenOut, amountIn, minAmountOut } = args
    return defineCall({
      address: Addresses.stablecoinDex,
      abi: Abis.stablecoinDex,
      functionName: 'swapExactAmountIn',
      args: [tokenIn, tokenOut, amountIn, minAmountOut],
    })
  }
}

/**
 * Sells a specific amount of tokens.
 *
 * @example
 * ```ts
 * import { createClient, http, parseUnits } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const result = await Actions.dex.sellSync(client, {
 *   amountIn: parseUnits('100', 6),
 *   minAmountOut: parseUnits('95', 6),
 *   tokenIn: '0x20c...11',
 *   tokenOut: '0x20c...20',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt.
 */
export async function sellSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: sellSync.Parameters<chain, account>,
): Promise<sellSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await sell.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  return { receipt }
}

export namespace sellSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = sell.Parameters<chain, account>

  export type Args = sell.Args

  export type ReturnValue = Compute<{
    /** Transaction receipt. */
    receipt: TransactionReceipt
  }>

  // TODO: exhaustive error type
  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType
}

/**
 * Watches for flip order placed events.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const unwatch = Actions.dex.watchFlipOrderPlaced(client, {
 *   onFlipOrderPlaced: (args, log) => {
 *     console.log('Flip order placed:', args)
 *   },
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns A function to unsubscribe from the event.
 */
export function watchFlipOrderPlaced<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: watchFlipOrderPlaced.Parameters,
) {
  const { onFlipOrderPlaced, maker, token, ...rest } = parameters
  return watchContractEvent(client, {
    ...rest,
    address: Addresses.stablecoinDex,
    abi: Abis.stablecoinDex,
    eventName: 'OrderPlaced',
    args: {
      ...(maker !== undefined && { maker }),
      ...(token !== undefined && { token }),
    },
    onLogs: (logs) => {
      for (const log of logs) {
        if (log.args.isFlipOrder) onFlipOrderPlaced(log.args, log)
      }
    },
    strict: true,
  })
}

export declare namespace watchFlipOrderPlaced {
  export type Args = GetEventArgs<
    typeof Abis.stablecoinDex,
    'OrderPlaced',
    { IndexedOnly: false; Required: true }
  >

  export type Log = viem_Log<
    bigint,
    number,
    false,
    ExtractAbiItem<typeof Abis.stablecoinDex, 'OrderPlaced'>,
    true
  >

  export type Parameters = UnionOmit<
    WatchContractEventParameters<
      typeof Abis.stablecoinDex,
      'OrderPlaced',
      true
    >,
    'abi' | 'address' | 'batch' | 'eventName' | 'onLogs' | 'strict'
  > & {
    /** Address of the maker to filter events. */
    maker?: Address | undefined
    /** Callback to invoke when a flip order is placed. */
    onFlipOrderPlaced: (args: Args, log: Log) => void
    /** Address of the token to filter events. */
    token?: Address | undefined
  }
}

/**
 * Watches for order cancelled events.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const unwatch = Actions.dex.watchOrderCancelled(client, {
 *   onOrderCancelled: (args, log) => {
 *     console.log('Order cancelled:', args)
 *   },
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns A function to unsubscribe from the event.
 */
export function watchOrderCancelled<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: watchOrderCancelled.Parameters,
) {
  const { onOrderCancelled, orderId, ...rest } = parameters
  return watchContractEvent(client, {
    ...rest,
    address: Addresses.stablecoinDex,
    abi: Abis.stablecoinDex,
    eventName: 'OrderCancelled',
    args: orderId !== undefined ? { orderId } : undefined,
    onLogs: (logs) => {
      for (const log of logs) onOrderCancelled(log.args, log)
    },
    strict: true,
  })
}

export declare namespace watchOrderCancelled {
  export type Args = GetEventArgs<
    typeof Abis.stablecoinDex,
    'OrderCancelled',
    { IndexedOnly: false; Required: true }
  >

  export type Log = viem_Log<
    bigint,
    number,
    false,
    ExtractAbiItem<typeof Abis.stablecoinDex, 'OrderCancelled'>,
    true
  >

  export type Parameters = UnionOmit<
    WatchContractEventParameters<
      typeof Abis.stablecoinDex,
      'OrderCancelled',
      true
    >,
    'abi' | 'address' | 'batch' | 'eventName' | 'onLogs' | 'strict'
  > & {
    /** Callback to invoke when an order is cancelled. */
    onOrderCancelled: (args: Args, log: Log) => void
    /** Order ID to filter events. */
    orderId?: bigint | undefined
  }
}

/**
 * Watches for order filled events.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const unwatch = Actions.dex.watchOrderFilled(client, {
 *   onOrderFilled: (args, log) => {
 *     console.log('Order filled:', args)
 *   },
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns A function to unsubscribe from the event.
 */
export function watchOrderFilled<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: watchOrderFilled.Parameters,
) {
  const { onOrderFilled, maker, taker, orderId, ...rest } = parameters
  return watchContractEvent(client, {
    ...rest,
    address: Addresses.stablecoinDex,
    abi: Abis.stablecoinDex,
    eventName: 'OrderFilled',
    args: {
      ...(orderId !== undefined && { orderId }),
      ...(maker !== undefined && { maker }),
      ...(taker !== undefined && { taker }),
    },
    onLogs: (logs) => {
      for (const log of logs) onOrderFilled(log.args, log)
    },
    strict: true,
  })
}

export declare namespace watchOrderFilled {
  export type Args = GetEventArgs<
    typeof Abis.stablecoinDex,
    'OrderFilled',
    { IndexedOnly: false; Required: true }
  >

  export type Log = viem_Log<
    bigint,
    number,
    false,
    ExtractAbiItem<typeof Abis.stablecoinDex, 'OrderFilled'>,
    true
  >

  export type Parameters = UnionOmit<
    WatchContractEventParameters<
      typeof Abis.stablecoinDex,
      'OrderFilled',
      true
    >,
    'abi' | 'address' | 'batch' | 'eventName' | 'onLogs' | 'strict'
  > & {
    /** Address of the maker to filter events. */
    maker?: Address | undefined
    /** Callback to invoke when an order is filled. */
    onOrderFilled: (args: Args, log: Log) => void
    /** Order ID to filter events. */
    orderId?: bigint | undefined
    /** Address of the taker to filter events. */
    taker?: Address | undefined
  }
}

/**
 * Watches for order placed events.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const unwatch = Actions.dex.watchOrderPlaced(client, {
 *   onOrderPlaced: (args, log) => {
 *     console.log('Order placed:', args)
 *   },
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns A function to unsubscribe from the event.
 */
export function watchOrderPlaced<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: watchOrderPlaced.Parameters,
) {
  const { onOrderPlaced, maker, token, ...rest } = parameters
  return watchContractEvent(client, {
    ...rest,
    address: Addresses.stablecoinDex,
    abi: Abis.stablecoinDex,
    eventName: 'OrderPlaced',
    args: {
      ...(maker !== undefined && { maker }),
      ...(token !== undefined && { token }),
    },
    onLogs: (logs) => {
      for (const log of logs) onOrderPlaced(log.args, log)
    },
    strict: true,
  })
}

export declare namespace watchOrderPlaced {
  export type Args = GetEventArgs<
    typeof Abis.stablecoinDex,
    'OrderPlaced',
    { IndexedOnly: false; Required: true }
  >

  export type Log = viem_Log<
    bigint,
    number,
    false,
    ExtractAbiItem<typeof Abis.stablecoinDex, 'OrderPlaced'>,
    true
  >

  export type Parameters = UnionOmit<
    WatchContractEventParameters<
      typeof Abis.stablecoinDex,
      'OrderPlaced',
      true
    >,
    'abi' | 'address' | 'batch' | 'eventName' | 'onLogs' | 'strict'
  > & {
    /** Address of the maker to filter events. */
    maker?: Address | undefined
    /** Callback to invoke when an order is placed. */
    onOrderPlaced: (args: Args, log: Log) => void
    /** Address of the token to filter events. */
    token?: Address | undefined
  }
}

/**
 * Withdraws tokens from the DEX to the caller's wallet.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const hash = await Actions.dex.withdraw(client, {
 *   amount: 100n,
 *   token: '0x20c...11',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function withdraw<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: withdraw.Parameters<chain, account>,
): Promise<withdraw.ReturnValue> {
  return withdraw.inner(writeContract, client, parameters)
}

export namespace withdraw {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** Amount to withdraw. */
    amount: bigint
    /** Address of the token to withdraw. */
    token: Address
  }

  export type ReturnValue = WriteContractReturnType

  // TODO: exhaustive error type
  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType

  /** @internal */
  export async function inner<
    action extends typeof writeContract | typeof writeContractSync,
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    action: action,
    client: Client<Transport, chain, account>,
    parameters: withdraw.Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const { token, amount, ...rest } = parameters
    const call = withdraw.call({ token, amount })
    return (await withExecutionError(action)(client, {
      ...rest,
      ...call,
    } as never)) as never
  }

  /**
   * Defines a call to the `withdraw` function.
   *
   * Can be passed as a parameter to:
   * - [`estimateContractGas`](https://viem.sh/docs/contract/estimateContractGas): estimate the gas cost of the call
   * - [`simulateContract`](https://viem.sh/docs/contract/simulateContract): simulate the call
   * - [`sendCalls`](https://viem.sh/docs/actions/wallet/sendCalls): send multiple calls
   *
   * @example
   * ```ts
   * import { createClient, http, parseUnits, walletActions } from 'viem'
   * import { tempo } from 'viem/chains'
   * import { Actions } from 'viem/tempo'
   *
   * const client = createClient({
   *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' })
   *   transport: http(),
   * }).extend(walletActions)
   *
   * const { result } = await client.sendCalls({
   *   calls: [
   *     Actions.dex.withdraw.call({
   *       amount: parseUnits('100', 6),
   *       token: '0x20c0...beef',
   *     }),
   *   ]
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { token, amount } = args
    return defineCall({
      address: Addresses.stablecoinDex,
      abi: Abis.stablecoinDex,
      functionName: 'withdraw',
      args: [token, amount],
    })
  }
}

/**
 * Withdraws tokens from the DEX to the caller's wallet.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const result = await Actions.dex.withdrawSync(client, {
 *   amount: 100n,
 *   token: '0x20c...11',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt.
 */
export async function withdrawSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: withdrawSync.Parameters<chain, account>,
): Promise<withdrawSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await withdraw.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  return { receipt }
}

export namespace withdrawSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = withdraw.Parameters<chain, account>

  export type Args = withdraw.Args

  export type ReturnValue = Compute<{
    /** Transaction receipt. */
    receipt: TransactionReceipt
  }>

  // TODO: exhaustive error type
  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType
}

function getPairKey(base: Address, quote: Address) {
  return Hash.keccak256(Hex.concat(base, quote))
}

// Errors

/** Errors this module throws for decoded Tempo errors. Narrow with `error.name`. */
export type ExecutionErrorType =
  | DexBelowMinimumOrderSizeErrorType
  | DexInsufficientBalanceErrorType
  | DexInsufficientLiquidityErrorType
  | DexInsufficientOutputErrorType
  | DexInvalidFlipTickErrorType
  | DexMaxInputExceededErrorType
  | DexOrderNotFoundErrorType
  | DexOrderNotStaleErrorType
  | DexPairNotFoundErrorType
  | DexTickOutOfBoundsErrorType

/** `DexInsufficientOutputError` with a literal `name`, for narrowing. */
export type DexInsufficientOutputErrorType = DexInsufficientOutputError & {
  name: 'DexInsufficientOutputError'
}

/** Thrown when a sell would return less than `minAmountOut`. */
export class DexInsufficientOutputError extends TempoExecutionError<
  Errors.TempoExecutionError.Decoded<'InsufficientOutput'>
> {
  /** Amount of `tokenIn` to sell. */
  amountIn: bigint | undefined
  /** Minimum amount of `tokenOut` to receive. */
  minAmountOut: bigint | undefined
  /** Current quote for `amountIn`, when available. */
  quote: bigint | undefined
  /** Token to sell. */
  tokenIn: Address | undefined
  /** Token to buy. */
  tokenOut: Address | undefined

  constructor(parameters: DexInsufficientOutputError.Parameters) {
    const { amountIn, minAmountOut, quote, tokenIn, tokenOut } = parameters
    super(parameters, {
      details: {
        'token in': tokenIn,
        'token out': tokenOut,
        'amount in': amountIn,
        'min amount out': minAmountOut,
        quote,
      },
      name: 'DexInsufficientOutputError',
    })
    this.amountIn = amountIn
    this.minAmountOut = minAmountOut
    this.quote = quote
    this.tokenIn = tokenIn
    this.tokenOut = tokenOut
  }
}

export declare namespace DexInsufficientOutputError {
  /** Constructor parameters. */
  type Parameters = Errors.TempoExecutionError.Parameters & {
    /** Amount of `tokenIn` to sell. */
    amountIn?: bigint | undefined
    /** Minimum amount of `tokenOut` to receive. */
    minAmountOut?: bigint | undefined
    /** Current quote for `amountIn`, when available. */
    quote?: bigint | undefined
    /** Token to sell. */
    tokenIn?: Address | undefined
    /** Token to buy. */
    tokenOut?: Address | undefined
  }
}

/** `DexMaxInputExceededError` with a literal `name`, for narrowing. */
export type DexMaxInputExceededErrorType = DexMaxInputExceededError & {
  name: 'DexMaxInputExceededError'
}

/** Thrown when a buy would cost more than `maxAmountIn`. */
export class DexMaxInputExceededError extends TempoExecutionError<
  Errors.TempoExecutionError.Decoded<'MaxInputExceeded'>
> {
  /** Amount of `tokenOut` to buy. */
  amountOut: bigint | undefined
  /** Maximum amount of `tokenIn` to spend. */
  maxAmountIn: bigint | undefined
  /** Current cost of `amountOut`, when available. */
  quote: bigint | undefined
  /** Token to spend. */
  tokenIn: Address | undefined
  /** Token to buy. */
  tokenOut: Address | undefined

  constructor(parameters: DexMaxInputExceededError.Parameters) {
    const { amountOut, maxAmountIn, quote, tokenIn, tokenOut } = parameters
    super(parameters, {
      details: {
        'token in': tokenIn,
        'token out': tokenOut,
        'amount out': amountOut,
        'max amount in': maxAmountIn,
        quote,
      },
      name: 'DexMaxInputExceededError',
    })
    this.amountOut = amountOut
    this.maxAmountIn = maxAmountIn
    this.quote = quote
    this.tokenIn = tokenIn
    this.tokenOut = tokenOut
  }
}

export declare namespace DexMaxInputExceededError {
  /** Constructor parameters. */
  type Parameters = Errors.TempoExecutionError.Parameters & {
    /** Amount of `tokenOut` to buy. */
    amountOut?: bigint | undefined
    /** Maximum amount of `tokenIn` to spend. */
    maxAmountIn?: bigint | undefined
    /** Current cost of `amountOut`, when available. */
    quote?: bigint | undefined
    /** Token to spend. */
    tokenIn?: Address | undefined
    /** Token to buy. */
    tokenOut?: Address | undefined
  }
}

/** `DexInsufficientLiquidityError` with a literal `name`, for narrowing. */
export type DexInsufficientLiquidityErrorType =
  DexInsufficientLiquidityError & { name: 'DexInsufficientLiquidityError' }

/** Thrown when the order book cannot fill a swap. */
export class DexInsufficientLiquidityError extends TempoExecutionError<
  Errors.TempoExecutionError.Decoded<'InsufficientLiquidity'>
> {
  /** Amount of `tokenIn` to sell, for sells. */
  amountIn: bigint | undefined
  /** Amount of `tokenOut` to buy, for buys. */
  amountOut: bigint | undefined
  /** Token to spend. */
  tokenIn: Address | undefined
  /** Token to buy. */
  tokenOut: Address | undefined

  constructor(
    parameters: Errors.TempoExecutionError.Parameters & {
      amountIn?: bigint | undefined
      amountOut?: bigint | undefined
      tokenIn?: Address | undefined
      tokenOut?: Address | undefined
    },
  ) {
    const { amountIn, amountOut, tokenIn, tokenOut } = parameters
    super(parameters, {
      details: {
        'token in': tokenIn,
        'token out': tokenOut,
        'amount in': amountIn,
        'amount out': amountOut,
      },
      name: 'DexInsufficientLiquidityError',
    })
    this.amountIn = amountIn
    this.amountOut = amountOut
    this.tokenIn = tokenIn
    this.tokenOut = tokenOut
  }
}

/** `DexBelowMinimumOrderSizeError` with a literal `name`, for narrowing. */
export type DexBelowMinimumOrderSizeErrorType =
  DexBelowMinimumOrderSizeError & { name: 'DexBelowMinimumOrderSizeError' }

/** Thrown when an order is smaller than the minimum order size. */
export class DexBelowMinimumOrderSizeError extends TempoExecutionError<
  Errors.TempoExecutionError.Decoded<'BelowMinimumOrderSize'>
> {
  /** Order amount. */
  amount: bigint
  /** Minimum order amount, when known. */
  minimum: bigint | undefined

  constructor(
    parameters: Errors.TempoExecutionError.Parameters & {
      minimum?: bigint | undefined
    },
  ) {
    const [amount] = parameters.error.args as readonly [bigint]
    const { minimum } = parameters
    super(parameters, {
      details: { amount, minimum },
      name: 'DexBelowMinimumOrderSizeError',
      shortMessage: `Order amount ${amount} is below the minimum${minimum === undefined ? '' : ` of ${minimum}`}.`,
    })
    this.amount = amount
    this.minimum = minimum
  }
}

/** `DexTickOutOfBoundsError` with a literal `name`, for narrowing. */
export type DexTickOutOfBoundsErrorType = DexTickOutOfBoundsError & {
  name: 'DexTickOutOfBoundsError'
}

/** Thrown when an order's tick or flip tick is outside the allowed range. */
export class DexTickOutOfBoundsError extends TempoExecutionError<
  Errors.TempoExecutionError.Decoded<'TickOutOfBounds'>
> {
  /** Highest allowed tick, when known. */
  maxTick: number | undefined
  /** Lowest allowed tick, when known. */
  minTick: number | undefined
  /** Tick that is out of range. */
  tick: number

  constructor(
    parameters: Errors.TempoExecutionError.Parameters & {
      maxTick?: number | undefined
      minTick?: number | undefined
    },
  ) {
    const [tick] = parameters.error.args as readonly [number]
    const { maxTick, minTick } = parameters
    super(parameters, {
      details: {
        tick,
        range:
          minTick === undefined || maxTick === undefined
            ? undefined
            : `${minTick} to ${maxTick}`,
      },
      name: 'DexTickOutOfBoundsError',
    })
    this.maxTick = maxTick
    this.minTick = minTick
    this.tick = tick
  }
}

/** `DexInvalidFlipTickError` with a literal `name`, for narrowing. */
export type DexInvalidFlipTickErrorType = DexInvalidFlipTickError & {
  name: 'DexInvalidFlipTickError'
}

/** Thrown when a flip order's flip tick is on the wrong side of its tick or off the tick spacing. */
export class DexInvalidFlipTickError extends TempoExecutionError<
  Errors.TempoExecutionError.Decoded<'InvalidFlipTick'>
> {
  /** Flip tick. */
  flipTick: number | undefined
  /** Order side. */
  side: 'buy' | 'sell' | undefined
  /** Order tick. */
  tick: number | undefined
  /** Tick spacing, when known. */
  tickSpacing: number | undefined

  constructor(
    parameters: Errors.TempoExecutionError.Parameters & {
      flipTick?: number | undefined
      side?: 'buy' | 'sell' | undefined
      tick?: number | undefined
      tickSpacing?: number | undefined
    },
  ) {
    const { flipTick, side, tick, tickSpacing } = parameters
    super(parameters, {
      details: {
        side,
        tick,
        'flip tick': flipTick,
        'tick spacing': tickSpacing,
      },
      name: 'DexInvalidFlipTickError',
      shortMessage:
        side === 'buy'
          ? 'The flip tick of a buy order must be at or above its tick, and a multiple of the tick spacing.'
          : side === 'sell'
            ? 'The flip tick of a sell order must be at or below its tick, and a multiple of the tick spacing.'
            : undefined,
    })
    this.flipTick = flipTick
    this.side = side
    this.tick = tick
    this.tickSpacing = tickSpacing
  }
}

/** `DexOrderNotFoundError` with a literal `name`, for narrowing. */
export type DexOrderNotFoundErrorType = DexOrderNotFoundError & {
  name: 'DexOrderNotFoundError'
}

/** Thrown when an order does not exist or is already filled. */
export class DexOrderNotFoundError extends TempoExecutionError<
  Errors.TempoExecutionError.Decoded<'OrderDoesNotExist'>
> {
  /** Order ID. */
  orderId: bigint

  constructor(
    parameters: Errors.TempoExecutionError.Parameters & { orderId: bigint },
  ) {
    super(parameters, {
      details: { order: parameters.orderId },
      name: 'DexOrderNotFoundError',
      shortMessage: `Order ${parameters.orderId} does not exist or is already filled.`,
    })
    this.orderId = parameters.orderId
  }
}

/** `DexOrderNotStaleError` with a literal `name`, for narrowing. */
export type DexOrderNotStaleErrorType = DexOrderNotStaleError & {
  name: 'DexOrderNotStaleError'
}

/** Thrown when cancelling a stale order whose maker is still authorized by the token's policy. */
export class DexOrderNotStaleError extends TempoExecutionError<
  Errors.TempoExecutionError.Decoded<'OrderNotStale'>
> {
  /** Order ID. */
  orderId: bigint

  constructor(
    parameters: Errors.TempoExecutionError.Parameters & { orderId: bigint },
  ) {
    super(parameters, {
      details: { order: parameters.orderId },
      name: 'DexOrderNotStaleError',
      shortMessage: `Order ${parameters.orderId} is not stale: its maker is still authorized.`,
    })
    this.orderId = parameters.orderId
  }
}

/** `DexPairNotFoundError` with a literal `name`, for narrowing. */
export type DexPairNotFoundErrorType = DexPairNotFoundError & {
  name: 'DexPairNotFoundError'
}

/** Thrown when no trading pair exists for a token. */
export class DexPairNotFoundError extends TempoExecutionError<
  Errors.TempoExecutionError.Decoded<'PairDoesNotExist'>
> {
  /** Tokens of the call. */
  tokens: readonly Address[]

  constructor(
    parameters: Errors.TempoExecutionError.Parameters & {
      tokens: readonly Address[]
    },
  ) {
    super(parameters, {
      details: { tokens: parameters.tokens.join(', ') || undefined },
      name: 'DexPairNotFoundError',
    })
    this.tokens = parameters.tokens
  }
}

/** `DexInsufficientBalanceError` with a literal `name`, for narrowing. */
export type DexInsufficientBalanceErrorType = DexInsufficientBalanceError & {
  name: 'DexInsufficientBalanceError'
}

/** Thrown when withdrawing more than the account's exchange balance. */
export class DexInsufficientBalanceError extends TempoExecutionError<
  Errors.TempoExecutionError.Decoded<'InsufficientBalance'>
> {
  /** Amount to withdraw. */
  amount: bigint | undefined
  /** Exchange balance, when known. */
  balance: bigint | undefined
  /** Token address. */
  token: Address

  constructor(
    parameters: Errors.TempoExecutionError.Parameters & {
      amount?: bigint | undefined
      balance?: bigint | undefined
      token: Address
    },
  ) {
    const { amount, balance, token } = parameters
    super(parameters, {
      details: { token, amount, balance },
      name: 'DexInsufficientBalanceError',
      shortMessage: `Insufficient exchange balance of token "${token}".`,
    })
    this.amount = amount
    this.balance = balance
    this.token = token
  }
}

const exchange = {
  address: Addresses.stablecoinDex,
  abi: Abis.stablecoinDex,
} as const

/** The failed call, when it targets the exchange. */
function getExchangeCall(context: Context) {
  const { call } = context
  return call && isAddressEqual(call.address, Addresses.stablecoinDex)
    ? call
    : undefined
}

/** @internal */
export const errorResolvers: Resolvers = {
  'BelowMinimumOrderSize(uint128)': async (context) => {
    if (!getExchangeCall(context) || !context.base.error.args) return undefined
    const [minimum] = await context.read([
      { ...exchange, functionName: 'MIN_ORDER_AMOUNT' },
    ])
    return new DexBelowMinimumOrderSizeError({
      ...context.base,
      minimum: minimum?.result,
    })
  },
  'InsufficientBalance()': async (context) => {
    const call = getExchangeCall(context)
    const token = call?.arg<Address>('token')
    if (call?.functionName !== 'withdraw' || !token || !context.signer)
      return undefined
    const [balance] = await context.read([
      {
        ...exchange,
        functionName: 'balanceOf',
        args: [context.signer.address, token],
      },
    ])
    return new DexInsufficientBalanceError({
      ...context.base,
      amount: call.arg<bigint>('amount'),
      balance: balance?.result,
      token,
    })
  },
  'InsufficientLiquidity()': (context) => {
    const call = getExchangeCall(context)
    if (!call) return undefined
    return new DexInsufficientLiquidityError({
      ...context.base,
      amountIn: call.arg<bigint>('amountIn'),
      amountOut: call.arg<bigint>('amountOut'),
      tokenIn: call.arg<Address>('tokenIn'),
      tokenOut: call.arg<Address>('tokenOut'),
    })
  },
  'InsufficientOutput()': async (context) => {
    const call = getExchangeCall(context)
    if (!call) return undefined
    const tokenIn = call.arg<Address>('tokenIn')!
    const tokenOut = call.arg<Address>('tokenOut')!
    const amountIn = call.arg<bigint>('amountIn')!
    const [quote] = await context.read([
      {
        ...exchange,
        functionName: 'quoteSwapExactAmountIn',
        args: [tokenIn, tokenOut, amountIn],
      },
    ])
    return new DexInsufficientOutputError({
      ...context.base,
      amountIn,
      minAmountOut: call.arg<bigint>('minAmountOut'),
      quote: quote?.result,
      tokenIn,
      tokenOut,
    })
  },
  'InvalidFlipTick()': async (context) => {
    const call = getExchangeCall(context)
    if (!call) return undefined
    const [tickSpacing] = await context.read([
      { ...exchange, functionName: 'TICK_SPACING' },
    ])
    const isBid = call.arg<boolean>('isBid')
    return new DexInvalidFlipTickError({
      ...context.base,
      flipTick: call.arg<number>('flipTick'),
      side: isBid === undefined ? undefined : isBid ? 'buy' : 'sell',
      tick: call.arg<number>('tick'),
      tickSpacing: tickSpacing?.result,
    })
  },
  'MaxInputExceeded()': async (context) => {
    const call = getExchangeCall(context)
    if (!call) return undefined
    const tokenIn = call.arg<Address>('tokenIn')!
    const tokenOut = call.arg<Address>('tokenOut')!
    const amountOut = call.arg<bigint>('amountOut')!
    const [quote] = await context.read([
      {
        ...exchange,
        functionName: 'quoteSwapExactAmountOut',
        args: [tokenIn, tokenOut, amountOut],
      },
    ])
    return new DexMaxInputExceededError({
      ...context.base,
      amountOut,
      maxAmountIn: call.arg<bigint>('maxAmountIn'),
      quote: quote?.result,
      tokenIn,
      tokenOut,
    })
  },
  'OrderDoesNotExist()': (context) => {
    const orderId = getExchangeCall(context)?.arg<bigint>('orderId')
    if (orderId === undefined) return undefined
    return new DexOrderNotFoundError({ ...context.base, orderId })
  },
  'OrderNotStale()': (context) => {
    const orderId = getExchangeCall(context)?.arg<bigint>('orderId')
    if (orderId === undefined) return undefined
    return new DexOrderNotStaleError({ ...context.base, orderId })
  },
  'PairDoesNotExist()': (context) => {
    const call = getExchangeCall(context)
    if (!call) return undefined
    const tokens = ['token', 'tokenIn', 'tokenOut', 'base'].flatMap((name) => {
      const token = call.arg<Address>(name)
      return token ? [token] : []
    })
    return new DexPairNotFoundError({ ...context.base, tokens })
  },
  'TickOutOfBounds(int16)': async (context) => {
    if (!getExchangeCall(context) || !context.base.error.args) return undefined
    const [minTick, maxTick] = await context.read([
      { ...exchange, functionName: 'MIN_TICK' },
      { ...exchange, functionName: 'MAX_TICK' },
    ])
    return new DexTickOutOfBoundsError({
      ...context.base,
      maxTick: maxTick?.result,
      minTick: minTick?.result,
    })
  },
}
