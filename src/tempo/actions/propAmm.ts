import type { Address } from 'abitype'
import type { Account } from '../../accounts/types.js'
import { parseAccount } from '../../accounts/utils/parseAccount.js'
import { estimateGas as core_estimateGas } from '../../actions/public/estimateGas.js'
import type { ReadContractReturnType } from '../../actions/public/readContract.js'
import { readContract } from '../../actions/public/readContract.js'
import {
  type SendTransactionReturnType,
  sendTransaction,
} from '../../actions/wallet/sendTransaction.js'
import { sendTransactionSync } from '../../actions/wallet/sendTransactionSync.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { BaseErrorType } from '../../errors/base.js'
import type { Chain } from '../../types/chain.js'
import type { GetEventArgs } from '../../types/contract.js'
import type { Log } from '../../types/log.js'
import type { Hex } from '../../types/misc.js'
import type { TransactionReceipt } from '../../types/transaction.js'
import type { Compute, UnionOmit } from '../../types/utils.js'
import { parseEventLogs } from '../../utils/abi/parseEventLogs.js'
import { isAddressEqual } from '../../utils/address/isAddressEqual.js'
import * as Abis from '../Abis.js'
import type { ReadParameters, WriteParameters } from '../internal/types.js'
import { defineCall, pickWriteParameters } from '../internal/utils.js'
import type { TransactionReceipt as TempoTransactionReceipt } from '../Transaction.js'
import * as simulateActions from './simulate.js'
import * as tokenActions from './token.js'

/**
 * Reads the base token of a propAMM pool.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({ chain: tempo, transport: http() })
 *
 * const token = await Actions.propAmm.baseToken(client, { pool: '0x...' })
 * ```
 *
 * @param client - Client.
 * @param parameters - Pool and read options.
 * @returns Base token address.
 */
export async function baseToken<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: baseToken.Parameters,
): Promise<baseToken.ReturnValue> {
  const { pool, ...rest } = parameters
  return readContract(client, { ...rest, ...baseToken.call({ pool }) })
}

export namespace baseToken {
  export type Args = {
    /** Pool address. */
    pool: Address
  }

  export type Parameters = ReadParameters & Args

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.directPropAmm,
    'baseToken'
  >

  /**
   * Defines the pool's `baseToken` call.
   */
  export function call({ pool }: Args) {
    return defineCall({
      abi: Abis.directPropAmm,
      address: pool,
      functionName: 'baseToken',
    })
  }
}

/**
 * Reads the quote token of a propAMM pool.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({ chain: tempo, transport: http() })
 *
 * const token = await Actions.propAmm.quoteToken(client, { pool: '0x...' })
 * ```
 *
 * @param client - Client.
 * @param parameters - Pool and read options.
 * @returns Quote token address.
 */
export async function quoteToken<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: quoteToken.Parameters,
): Promise<quoteToken.ReturnValue> {
  const { pool, ...rest } = parameters
  return readContract(client, { ...rest, ...quoteToken.call({ pool }) })
}

export namespace quoteToken {
  export type Args = {
    /** Pool address. */
    pool: Address
  }

  export type Parameters = ReadParameters & Args

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.directPropAmm,
    'quoteToken'
  >

  /**
   * Defines the pool's `quoteToken` call.
   */
  export function call({ pool }: Args) {
    return defineCall({
      abi: Abis.directPropAmm,
      address: pool,
      functionName: 'quoteToken',
    })
  }
}

/**
 * Reads whether a propAMM pool is paused.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({ chain: tempo, transport: http() })
 *
 * const isPaused = await Actions.propAmm.paused(client, { pool: '0x...' })
 * ```
 *
 * @param client - Client.
 * @param parameters - Pool and read options.
 * @returns Whether swaps are paused.
 */
export async function paused<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: paused.Parameters,
): Promise<paused.ReturnValue> {
  const { pool, ...rest } = parameters
  return readContract(client, { ...rest, ...paused.call({ pool }) })
}

export namespace paused {
  export type Args = {
    /** Pool address. */
    pool: Address
  }

  export type Parameters = ReadParameters & Args

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.directPropAmm,
    'paused'
  >

  /**
   * Defines the pool's `paused` call.
   */
  export function call({ pool }: Args) {
    return defineCall({
      abi: Abis.directPropAmm,
      address: pool,
      functionName: 'paused',
    })
  }
}

/**
 * Reads whether an address may call swaps on a pool.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({ chain: tempo, transport: http() })
 *
 * const allowed = await Actions.propAmm.takerAllowed(client, { pool: '0x...', taker: '0x...' })
 * ```
 *
 * @param client - Client.
 * @param parameters - Pool, taker, and read options.
 * @returns Whether the taker is allowed.
 */
export async function takerAllowed<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: takerAllowed.Parameters,
): Promise<takerAllowed.ReturnValue> {
  const { pool, taker, ...rest } = parameters
  return readContract(client, {
    ...rest,
    ...takerAllowed.call({ pool, taker }),
  })
}

export namespace takerAllowed {
  export type Args = {
    /** Pool address. */
    pool: Address
    /** Address that calls the swap. */
    taker: Address
  }

  export type Parameters = ReadParameters & Args

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.directPropAmm,
    'takerAllowed'
  >

  /**
   * Defines the pool's `takerAllowed` call.
   */
  export function call({ pool, taker }: Args) {
    return defineCall({
      abi: Abis.directPropAmm,
      address: pool,
      args: [taker],
      functionName: 'takerAllowed',
    })
  }
}

/**
 * Reads whether a resolved address may receive swap output.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({ chain: tempo, transport: http() })
 *
 * const allowed = await Actions.propAmm.recipientAllowed(client, { pool: '0x...', recipient: '0x...' })
 * ```
 *
 * @param client - Client.
 * @param parameters - Pool, resolved recipient, and read options.
 * @returns Whether the resolved recipient is allowed.
 */
export async function recipientAllowed<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: recipientAllowed.Parameters,
): Promise<recipientAllowed.ReturnValue> {
  const { pool, recipient, ...rest } = parameters
  return readContract(client, {
    ...rest,
    ...recipientAllowed.call({ pool, recipient }),
  })
}

export namespace recipientAllowed {
  export type Args = {
    /** Pool address. */
    pool: Address
    /** Resolved address to check. */
    recipient: Address
  }

  export type Parameters = ReadParameters & Args

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.directPropAmm,
    'recipientAllowed'
  >

  /**
   * Defines the pool's `recipientAllowed` call.
   */
  export function call({ pool, recipient }: Args) {
    return defineCall({
      abi: Abis.directPropAmm,
      address: pool,
      args: [recipient],
      functionName: 'recipientAllowed',
    })
  }
}

/**
 * Resolves a Tempo recipient to the address checked by the pool's allowlist.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({ chain: tempo, transport: http() })
 *
 * const resolved = await Actions.propAmm.resolveRecipient(client, { pool: '0x...', recipient: '0x...' })
 * ```
 *
 * @param client - Client.
 * @param parameters - Pool, recipient, and read options.
 * @returns Resolved recipient address.
 */
export async function resolveRecipient<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: resolveRecipient.Parameters,
): Promise<resolveRecipient.ReturnValue> {
  const { pool, recipient, ...rest } = parameters
  return readContract(client, {
    ...rest,
    ...resolveRecipient.call({ pool, recipient }),
  })
}

export namespace resolveRecipient {
  export type Args = {
    /** Pool address. */
    pool: Address
    /** Destination provided to the swap. */
    recipient: Address
  }

  export type Parameters = ReadParameters & Args

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.directPropAmm,
    'resolveRecipient'
  >

  /**
   * Defines the pool's `resolveRecipient` call.
   */
  export function call({ pool, recipient }: Args) {
    return defineCall({
      abi: Abis.directPropAmm,
      address: pool,
      args: [recipient],
      functionName: 'resolveRecipient',
    })
  }
}

/**
 * Quotes an exact input or exact output for a caller, recipient, and customer route.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({ chain: tempo, transport: http() })
 *
 * const { amountOut, price, updatedAt } = await Actions.propAmm.getSwapQuote(client, {
 *   pool: '0x...',
 *   taker: '0x...',
 *   recipient: '0x...',
 *   customerId: '0x...',
 *   mode: 'exactInput',
 *   baseToQuote: true,
 *   amountIn: 1_000_000n,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Route, swap mode, amount, and read options. Taker defaults to the read or client account.
 * @returns Quoted counteramount, oracle price, observation time, and remaining rounding credit.
 */
export async function getSwapQuote<
  chain extends Chain | undefined,
  const parameters extends getSwapQuote.Parameters,
>(
  client: Client<Transport, chain>,
  parameters: parameters,
): Promise<getSwapQuote.ReturnValue<parameters>>
export async function getSwapQuote(
  client: Client,
  parameters: getSwapQuote.Parameters,
): Promise<getSwapQuote.ReturnValue> {
  const account = parameters.account ?? client.account
  const taker = parameters.taker ?? (account && parseAccount(account).address)
  if (!taker) throw new Error('A taker or client account is required to quote.')
  const [amount, price, updatedAt, creditAfter] = await (readContract(client, {
    ...parameters,
    ...getSwapQuote.call({ ...parameters, taker }),
  } as never) as Promise<
    ReadContractReturnType<typeof Abis.directPropAmm, 'quoteExactInputFor'>
  >)
  return {
    ...(parameters.mode === 'exactInput'
      ? { amountOut: amount }
      : { amountIn: amount }),
    price,
    updatedAt,
    creditAfter,
  }
}

export namespace getSwapQuote {
  export type Args = {
    /** True sends base and receives quote; false sends quote and receives base. */
    baseToQuote: boolean
    /** Nonzero attribution and rounding-route identifier. */
    customerId: Hex
    /** Pool address. */
    pool: Address
    /** Destination of the output token. */
    recipient: Address
    /** Address that will call the swap. */
    taker: Address
  } & (
    | {
        /** Exact-input quote. */
        mode: 'exactInput'
        /** Input amount in token base units. */
        amountIn: bigint
      }
    | {
        /** Exact-output quote. */
        mode: 'exactOutput'
        /** Output amount in token base units. */
        amountOut: bigint
      }
  )

  export type Parameters = ReadParameters &
    UnionOmit<Args, 'taker'> & {
      /** Address that will call the swap. Defaults to the read account or client account. */
      taker?: Address | undefined
    }

  /** Quoted amount, oracle observation, and remaining rounding credit. */

  export type ReturnValue<parameters extends Parameters = Parameters> = Compute<
    {
      /** Oracle price used for the quote. */
      price: bigint
      /** Oracle observation timestamp. */
      updatedAt: bigint
      /** Route's remaining rounding credit. */
      creditAfter: bigint
    } & (parameters extends { mode: 'exactInput' }
      ? {
          /** Quoted output amount in token base units. */
          amountOut: bigint
        }
      : {
          /** Required input amount in token base units. */
          amountIn: bigint
        })
  >

  /**
   * Defines a route-aware quote call.
   */
  export function call(
    parameters: Extract<Args, { mode: 'exactInput' }>,
  ): ReturnType<typeof quoteExactInputCall>
  export function call(
    parameters: Extract<Args, { mode: 'exactOutput' }>,
  ): ReturnType<typeof quoteExactOutputCall>
  export function call(
    parameters: Args,
  ):
    | ReturnType<typeof quoteExactInputCall>
    | ReturnType<typeof quoteExactOutputCall>
  export function call(parameters: Args) {
    if (parameters.mode === 'exactInput') return quoteExactInputCall(parameters)
    return quoteExactOutputCall(parameters)
  }
}

function quoteExactInputCall(
  parameters: Extract<getSwapQuote.Args, { mode: 'exactInput' }>,
) {
  const { amountIn, baseToQuote, customerId, pool, recipient, taker } =
    parameters
  return defineCall({
    abi: Abis.directPropAmm,
    address: pool,
    args: [taker, recipient, customerId, baseToQuote, amountIn],
    functionName: 'quoteExactInputFor',
  })
}

function quoteExactOutputCall(
  parameters: Extract<getSwapQuote.Args, { mode: 'exactOutput' }>,
) {
  const { amountOut, baseToQuote, customerId, pool, recipient, taker } =
    parameters
  return defineCall({
    abi: Abis.directPropAmm,
    address: pool,
    args: [taker, recipient, customerId, baseToQuote, amountOut],
    functionName: 'quoteExactOutputFor',
  })
}

/**
 * Internal exact-input contract call.
 */
namespace exactInput {
  export type Args = {
    amountIn: bigint
    baseToQuote: boolean
    customerId: Hex
    deadline: bigint
    expectedOraclePrice: bigint
    minAmountOut: bigint
    minimumOracleUpdatedAt: bigint
    oraclePriceToleranceBps: bigint
    pool: Address
    recipient: Address
    tradeId: Hex
  }

  export function call({
    amountIn,
    baseToQuote,
    customerId,
    deadline,
    expectedOraclePrice,
    minAmountOut,
    minimumOracleUpdatedAt,
    oraclePriceToleranceBps,
    pool,
    recipient,
    tradeId,
  }: Args) {
    return defineCall({
      abi: Abis.directPropAmm,
      address: pool,
      args: [
        baseToQuote,
        amountIn,
        minAmountOut,
        recipient,
        customerId,
        tradeId,
        deadline,
        expectedOraclePrice,
        oraclePriceToleranceBps,
        minimumOracleUpdatedAt,
      ],
      functionName: 'swapExactInput',
    })
  }
}

/**
 * Internal exact-output contract call.
 */
namespace exactOutput {
  export type Args = {
    amountOut: bigint
    baseToQuote: boolean
    customerId: Hex
    deadline: bigint
    expectedOraclePrice: bigint
    maxAmountIn: bigint
    minimumOracleUpdatedAt: bigint
    oraclePriceToleranceBps: bigint
    pool: Address
    recipient: Address
    tradeId: Hex
  }

  export function call({
    amountOut,
    baseToQuote,
    customerId,
    deadline,
    expectedOraclePrice,
    maxAmountIn,
    minimumOracleUpdatedAt,
    oraclePriceToleranceBps,
    pool,
    recipient,
    tradeId,
  }: Args) {
    return defineCall({
      abi: Abis.directPropAmm,
      address: pool,
      args: [
        baseToQuote,
        amountOut,
        maxAmountIn,
        recipient,
        customerId,
        tradeId,
        deadline,
        expectedOraclePrice,
        oraclePriceToleranceBps,
        minimumOracleUpdatedAt,
      ],
      functionName: 'swapExactOutput',
    })
  }
}

/**
 * Approves the input token and swaps through an allowed propAMM pool in one transaction.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({ chain: tempo, transport: http(), account: '0x...' })
 *
 * const hash = await Actions.propAmm.swap(client, {
 *   pool: '0x...',
 *   mode: 'exactInput',
 *   baseToQuote: true,
 *   amountIn: 1_000_000n,
 *   minAmountOut: 1_000_000n,
 *   recipient: '0x...',
 *   customerId: '0x...',
 *   tradeId: '0x...',
 *   deadline: 1_800_000_000n,
 *   expectedOraclePrice: 1_000_000_000_000_000_000n,
 *   minimumOracleUpdatedAt: 1_799_999_000n,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Swap and transaction options.
 * @returns Transaction hash.
 */
export async function swap<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: swap.Parameters<chain, account>,
): Promise<swap.ReturnValue> {
  return swap.inner(sendTransaction, client, parameters)
}

export namespace swap {
  export type Args = {
    /** True sends base and receives quote; false sends quote and receives base. */
    baseToQuote: boolean
    /** Nonzero attribution and rounding-route identifier. */
    customerId: Hex
    /** Last accepted execution timestamp in seconds. */
    deadline: bigint
    /** Oracle price returned by the quote. */
    expectedOraclePrice: bigint
    /** Earliest accepted oracle observation timestamp. */
    minimumOracleUpdatedAt: bigint
    /** Accepted oracle-price movement in basis points. Zero binds exactly. */
    oraclePriceToleranceBps: bigint
    /** Pool address. */
    pool: Address
    /** Destination of the output token. */
    recipient: Address
    /** Trade attribution value, not replay protection. */
    tradeId: Hex
  } & (
    | {
        /** Exact-input swap. */
        mode: 'exactInput'
        /** Exact input amount in token base units. */
        amountIn: bigint
        /** Lowest accepted output in token base units. */
        minAmountOut: bigint
      }
    | {
        /** Exact-output swap. */
        mode: 'exactOutput'
        /** Exact output amount in token base units. */
        amountOut: bigint
        /** Highest accepted input in token base units; unused approval remains. */
        maxAmountIn: bigint
      }
  )

  export type InputArgs = UnionOmit<Args, 'oraclePriceToleranceBps'> & {
    /** Accepted oracle-price movement in basis points. Defaults to zero. */
    oraclePriceToleranceBps?: bigint | undefined
  }

  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & InputArgs

  export type ReturnValue = SendTransactionReturnType

  export type ErrorType = BaseErrorType

  /** @internal */
  export async function inner<
    action extends typeof sendTransaction | typeof sendTransactionSync,
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    action: action,
    client: Client<Transport, chain, account>,
    parameters: Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    return (await action(client, {
      ...parameters,
      calls: await getCalls(client, parameters),
    } as never)) as never
  }

  async function getCalls<
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    client: Client<Transport, chain, account>,
    parameters: Parameters<chain, account>,
  ) {
    const tokenIn = await (parameters.baseToQuote
      ? baseToken(client, { pool: parameters.pool })
      : quoteToken(client, { pool: parameters.pool }))
    const amount =
      parameters.mode === 'exactInput'
        ? parameters.amountIn
        : parameters.maxAmountIn
    return [
      tokenActions.approve.call(client, {
        amount,
        spender: parameters.pool,
        token: tokenIn,
      }),
      swap.call({
        ...parameters,
        oraclePriceToleranceBps: parameters.oraclePriceToleranceBps ?? 0n,
      }),
    ] as const
  }

  /**
   * Estimates gas for the approval and swap transaction.
   *
   * @param client - Client.
   * @param parameters - Swap and transaction options.
   * @returns The gas estimate.
   */
  export async function estimateGas<
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    client: Client<Transport, chain, account>,
    parameters: Parameters<chain, account>,
  ): Promise<bigint> {
    return core_estimateGas(client, {
      ...pickWriteParameters(parameters as never),
      calls: await getCalls(client, parameters),
    } as never)
  }

  /**
   * Simulates the approval and swap calls without submitting a transaction.
   *
   * @param client - Client.
   * @param parameters - Swap and transaction options.
   * @returns The approval and swap simulation results.
   */
  export async function simulate<
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    client: Client<Transport, chain, account>,
    parameters: Parameters<chain, account>,
  ) {
    return simulateActions.simulateCalls(client, {
      account: parameters.account ?? client.account,
      calls: await getCalls(client, parameters),
    })
  }

  /**
   * Defines the raw swap call without its input-token approval.
   */
  export function call(
    parameters: Extract<Args, { mode: 'exactInput' }>,
  ): ReturnType<typeof exactInput.call>
  export function call(
    parameters: Extract<Args, { mode: 'exactOutput' }>,
  ): ReturnType<typeof exactOutput.call>
  export function call(
    parameters: Args,
  ): ReturnType<typeof exactInput.call> | ReturnType<typeof exactOutput.call>
  export function call(parameters: Args) {
    if (parameters.mode === 'exactInput') return exactInput.call(parameters)
    return exactOutput.call(parameters)
  }

  /**
   * Extracts the unique matching trade event from a receipt.
   */
  export function extractEvent(
    logs: Log[],
    args: { pool: Address; tradeId: Hex },
  ) {
    const matching = parseEventLogs({
      abi: Abis.directPropAmm,
      logs,
      eventName: 'TradeExecuted',
      strict: true,
    }).filter(
      (log) =>
        isAddressEqual(log.address, args.pool) &&
        log.args.tradeId.toLowerCase() === args.tradeId.toLowerCase(),
    )
    if (matching.length !== 1)
      throw new Error(
        `Expected one TradeExecuted event for pool ${args.pool} and trade ${args.tradeId}; found ${matching.length}.`,
      )
    return matching[0]!
  }
}

/**
 * Approves the input token, swaps, and returns the confirmed trade and receipt.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({ chain: tempo, transport: http(), account: '0x...' })
 *
 * const trade = await Actions.propAmm.swapSync(client, {
 *   pool: '0x...',
 *   mode: 'exactInput',
 *   baseToQuote: true,
 *   amountIn: 1_000_000n,
 *   minAmountOut: 1_000_000n,
 *   recipient: '0x...',
 *   customerId: '0x...',
 *   tradeId: '0x...',
 *   deadline: 1_800_000_000n,
 *   expectedOraclePrice: 1_000_000_000_000_000_000n,
 *   minimumOracleUpdatedAt: 1_799_999_000n,
 * })
 * console.log(trade.amountOut, trade.receipt.transactionHash)
 * ```
 *
 * @param client - Client.
 * @param parameters - Swap and transaction options.
 * @returns Confirmed trade data and receipt.
 */
export async function swapSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: swapSync.Parameters<chain, account>,
): Promise<swapSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await swap.inner(sendTransactionSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  if ((receipt as TempoTransactionReceipt).status === 'pending')
    return { receipt } as never
  const { args } = swap.extractEvent(receipt.logs, parameters)
  return { ...args, receipt } as never
}

export namespace swapSync {
  export type Args = swap.InputArgs

  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = swap.Parameters<chain, account>

  export type ReturnValue = Compute<
    GetEventArgs<
      typeof Abis.directPropAmm,
      'TradeExecuted',
      { IndexedOnly: false; Required: true }
    > & {
      /** Confirmed receipt. */
      receipt: TransactionReceipt
    }
  >
}
