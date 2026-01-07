import type { Address } from 'abitype'
import { PoolId, TokenId } from 'ox/tempo'
import type { Account } from '../../accounts/types.js'
import type { MulticallParameters } from '../../actions/public/multicall.js'
import { multicall } from '../../actions/public/multicall.js'
import type { ReadContractReturnType } from '../../actions/public/readContract.js'
import { readContract } from '../../actions/public/readContract.js'
import type { WatchContractEventParameters } from '../../actions/public/watchContractEvent.js'
import { watchContractEvent } from '../../actions/public/watchContractEvent.js'
import type { WriteContractReturnType } from '../../actions/wallet/writeContract.js'
import { writeContract } from '../../actions/wallet/writeContract.js'
import { writeContractSync } from '../../actions/wallet/writeContractSync.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Chain } from '../../types/chain.js'
import type { ExtractAbiItem, GetEventArgs } from '../../types/contract.js'
import type { Log, Log as viem_Log } from '../../types/log.js'
import type { Hex } from '../../types/misc.js'
import type { TransactionReceipt } from '../../types/transaction.js'
import type { Compute, OneOf, UnionOmit } from '../../types/utils.js'
import { parseEventLogs } from '../../utils/abi/parseEventLogs.js'
import * as Abis from '../Abis.js'
import * as Addresses from '../Addresses.js'
import type { ReadParameters, WriteParameters } from '../internal/types.js'
import { defineCall } from '../internal/utils.js'

/**
 * Gets the reserves for a liquidity pool.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'tempo.ts/chains'
 * import { Actions } from 'tempo.ts/viem'
 *
 * const client = createClient({
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const pool = await Actions.amm.getPool(client, {
 *   userToken: '0x...',
 *   validatorToken: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The pool reserves.
 */
export async function getPool<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: getPool.Parameters,
): Promise<getPool.ReturnValue> {
  const { userToken, validatorToken, ...rest } = parameters
  const [pool, totalSupply] = await multicall(client, {
    ...rest,
    contracts: getPool.calls({ userToken, validatorToken }),
    allowFailure: false,
    deployless: true,
  })
  return {
    reserveUserToken: pool.reserveUserToken,
    reserveValidatorToken: pool.reserveValidatorToken,
    totalSupply,
  }
}

export namespace getPool {
  export type Parameters = UnionOmit<
    MulticallParameters,
    'allowFailure' | 'contracts' | 'deployless'
  > &
    Args

  export type Args = {
    /** Address or ID of the user token. */
    userToken: TokenId.TokenIdOrAddress
    /** Address or ID of the validator token. */
    validatorToken: TokenId.TokenIdOrAddress
  }

  export type ReturnValue = Compute<{
    /** Reserve of user token. */
    reserveUserToken: bigint
    /** Reserve of validator token. */
    reserveValidatorToken: bigint
    /** Total supply of LP tokens. */
    totalSupply: bigint
  }>

  /**
   * Defines calls to the `getPool` and `totalSupply` functions.
   *
   * @param args - Arguments.
   * @returns The calls.
   */
  export function calls(args: Args) {
    const { userToken, validatorToken } = args
    return [
      defineCall({
        address: Addresses.feeManager,
        abi: Abis.feeAmm,
        args: [TokenId.toAddress(userToken), TokenId.toAddress(validatorToken)],
        functionName: 'getPool',
      }),
      defineCall({
        address: Addresses.feeManager,
        abi: Abis.feeAmm,
        args: [PoolId.from({ userToken, validatorToken })],
        functionName: 'totalSupply',
      }),
    ] as const
  }
}

/**
 * Gets the LP token balance for an account in a specific pool.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'tempo.ts/chains'
 * import { Actions } from 'tempo.ts/viem'
 *
 * const client = createClient({
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const poolId = await Actions.amm.getPoolId(client, {
 *   userToken: '0x...',
 *   validatorToken: '0x...',
 * })
 *
 * const balance = await Actions.amm.getLiquidityBalance(client, {
 *   poolId,
 *   address: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The LP token balance.
 */
export async function getLiquidityBalance<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: getLiquidityBalance.Parameters,
): Promise<getLiquidityBalance.ReturnValue> {
  const { address, poolId, userToken, validatorToken, ...rest } = parameters
  return readContract(client, {
    ...rest,
    ...getLiquidityBalance.call({
      address,
      poolId,
      userToken,
      validatorToken,
    } as never),
  })
}

export namespace getLiquidityBalance {
  export type Parameters = ReadParameters & Args

  export type Args = {
    /** Address to check balance for. */
    address: Address
  } & OneOf<
    | {
        /** Pool ID. */
        poolId: Hex
      }
    | {
        /** User token. */
        userToken: TokenId.TokenIdOrAddress
        /** Validator token. */
        validatorToken: TokenId.TokenIdOrAddress
      }
  >

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.feeAmm,
    'liquidityBalances',
    never
  >

  /**
   * Defines a call to the `liquidityBalances` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { address } = args
    const poolId = (() => {
      if ('poolId' in args && args.poolId) return args.poolId!
      if ('userToken' in args && 'validatorToken' in args)
        return PoolId.from({
          userToken: args.userToken,
          validatorToken: args.validatorToken,
        })
      throw new Error(
        '`poolId`, or `userToken` and `validatorToken` must be provided.',
      )
    })()
    return defineCall({
      address: Addresses.feeManager,
      abi: Abis.feeAmm,
      args: [poolId, address],
      functionName: 'liquidityBalances',
    })
  }
}

/**
 * Performs a rebalance swap from validator token to user token.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'tempo.ts/chains'
 * import { Actions } from 'tempo.ts/viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const hash = await Actions.amm.rebalanceSwap(client, {
 *   userToken: '0x...',
 *   validatorToken: '0x...',
 *   amountOut: 100n,
 *   to: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function rebalanceSwap<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: rebalanceSwap.Parameters<chain, account>,
): Promise<rebalanceSwap.ReturnValue> {
  return rebalanceSwap.inner(writeContract, client, parameters)
}

export namespace rebalanceSwap {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** Amount of user token to receive. */
    amountOut: bigint
    /** Address to send the user token to. */
    to: Address
    /** Address or ID of the user token. */
    userToken: TokenId.TokenIdOrAddress
    /** Address or ID of the validator token. */
    validatorToken: TokenId.TokenIdOrAddress
  }

  export type ReturnValue = WriteContractReturnType

  /** @internal */
  export async function inner<
    action extends typeof writeContract | typeof writeContractSync,
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    action: action,
    client: Client<Transport, chain, account>,
    parameters: rebalanceSwap.Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const { userToken, validatorToken, amountOut, to, ...rest } = parameters
    const call = rebalanceSwap.call({
      userToken,
      validatorToken,
      amountOut,
      to,
    })
    return (await action(client, {
      ...rest,
      ...call,
    } as never)) as never
  }

  /**
   * Defines a call to the `rebalanceSwap` function.
   *
   * Can be passed as a parameter to:
   * - [`estimateContractGas`](https://viem.sh/docs/contract/estimateContractGas): estimate the gas cost of the call
   * - [`simulateContract`](https://viem.sh/docs/contract/simulateContract): simulate the call
   * - [`sendCalls`](https://viem.sh/docs/actions/wallet/sendCalls): send multiple calls
   *
   * @example
   * ```ts
   * import { createClient, http, walletActions } from 'viem'
   * import { tempo } from 'tempo.ts/chains'
   * import { Actions } from 'tempo.ts/viem'
   *
   * const client = createClient({
   *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
   *   transport: http(),
   * }).extend(walletActions)
   *
   * const { result } = await client.sendCalls({
   *   calls: [
   *     actions.amm.rebalanceSwap.call({
   *       userToken: '0x20c0...beef',
   *       validatorToken: '0x20c0...babe',
   *       amountOut: 100n,
   *       to: '0xfeed...fede',
   *     }),
   *     actions.amm.rebalanceSwap.call({
   *       userToken: '0x20c0...babe',
   *       validatorToken: '0x20c0...babe',
   *       amountOut: 100n,
   *       to: '0xfeed...fede',
   *     }),
   *   ]
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { userToken, validatorToken, amountOut, to } = args
    return defineCall({
      address: Addresses.feeManager,
      abi: Abis.feeAmm,
      functionName: 'rebalanceSwap',
      args: [
        TokenId.toAddress(userToken),
        TokenId.toAddress(validatorToken),
        amountOut,
        to,
      ],
    })
  }

  /**
   * Extracts the `RebalanceSwap` event from logs.
   *
   * @param logs - The logs.
   * @returns The `RebalanceSwap` event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.feeAmm,
      logs,
      eventName: 'RebalanceSwap',
      strict: true,
    })
    if (!log) throw new Error('`RebalanceSwap` event not found.')
    return log
  }
}

/**
 * Performs a rebalance swap from validator token to user token.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'tempo.ts/chains'
 * import { Actions } from 'tempo.ts/viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const result = await Actions.amm.rebalanceSwapSync(client, {
 *   userToken: '0x...',
 *   validatorToken: '0x...',
 *   amountOut: 100n,
 *   to: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function rebalanceSwapSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: rebalanceSwapSync.Parameters<chain, account>,
): Promise<rebalanceSwapSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await rebalanceSwap.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = rebalanceSwap.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export namespace rebalanceSwapSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = rebalanceSwap.Parameters<chain, account>

  export type Args = rebalanceSwap.Args

  export type ReturnValue = Compute<
    GetEventArgs<
      typeof Abis.feeAmm,
      'RebalanceSwap',
      { IndexedOnly: false; Required: true }
    > & {
      /** Transaction receipt. */
      receipt: TransactionReceipt
    }
  >
}

/**
 * Adds liquidity to a pool.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'tempo.ts/chains'
 * import { Actions } from 'tempo.ts/viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const hash = await Actions.amm.mint(client, {
 *   userTokenAddress: '0x20c0...beef',
 *   validatorTokenAddress: '0x20c0...babe',
 *   validatorTokenAmount: 100n,
 *   to: '0xfeed...fede',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function mint<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: mint.Parameters<chain, account>,
): Promise<mint.ReturnValue> {
  return mint.inner(writeContract, client, parameters)
}

export namespace mint {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** Address to mint LP tokens to. */
    to: Address
    /** User token address. */
    userTokenAddress: TokenId.TokenIdOrAddress
    /** Validator token address. */
    validatorTokenAddress: TokenId.TokenIdOrAddress
    /** Amount of validator token to add. */
    validatorTokenAmount: bigint
  }

  export type ReturnValue = WriteContractReturnType

  /** @internal */
  export async function inner<
    action extends typeof writeContract | typeof writeContractSync,
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    action: action,
    client: Client<Transport, chain, account>,
    parameters: mint.Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const {
      to,
      userTokenAddress,
      validatorTokenAddress,
      validatorTokenAmount,
      ...rest
    } = parameters
    const call = mint.call({
      to,
      userTokenAddress,
      validatorTokenAddress,
      validatorTokenAmount,
    })
    return (await action(client, {
      ...rest,
      ...call,
    } as never)) as never
  }

  /**
   * Defines a call to the `mint` function.
   *
   * Can be passed as a parameter to:
   * - [`estimateContractGas`](https://viem.sh/docs/contract/estimateContractGas): estimate the gas cost of the call
   * - [`simulateContract`](https://viem.sh/docs/contract/simulateContract): simulate the call
   * - [`sendCalls`](https://viem.sh/docs/actions/wallet/sendCalls): send multiple calls
   *
   * @example
   * ```ts
   * import { createClient, http, walletActions } from 'viem'
   * import { tempo } from 'tempo.ts/chains'
   * import { Actions } from 'tempo.ts/viem'
   *
   * const client = createClient({
   *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
   *   transport: http(),
   * }).extend(walletActions)
   *
   * const { result } = await client.sendCalls({
   *   calls: [
   *     actions.amm.mint.call({
   *       userTokenAddress: '0x20c0...beef',
   *       validatorTokenAddress: '0x20c0...babe',
   *       validatorTokenAmount: 100n,
   *       to: '0xfeed...fede',
   *     }),
   *     actions.amm.mint.call({
   *       userTokenAddress: '0x20c0...babe',
   *       validatorTokenAddress: '0x20c0...babe',
   *       validatorTokenAmount: 100n,
   *       to: '0xfeed...fede',
   *     }),
   *   ]
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const {
      to,
      userTokenAddress,
      validatorTokenAddress,
      validatorTokenAmount,
    } = args
    return defineCall({
      address: Addresses.feeManager,
      abi: Abis.feeAmm,
      functionName: 'mint',
      args: [
        TokenId.toAddress(userTokenAddress),
        TokenId.toAddress(validatorTokenAddress),
        validatorTokenAmount,
        to,
      ],
    })
  }

  /**
   * Extracts the `Mint` event from logs.
   *
   * @param logs - The logs.
   * @returns The `Mint` event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.feeAmm,
      logs,
      eventName: 'Mint',
      strict: true,
    })
    if (!log) throw new Error('`Mint` event not found.')
    return log
  }
}

/**
 * Adds liquidity to a pool.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'tempo.ts/chains'
 * import { Actions } from 'tempo.ts/viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const hash = await Actions.amm.mint(client, {
 *   userTokenAddress: '0x20c0...beef',
 *   validatorTokenAddress: '0x20c0...babe',
 *   validatorTokenAmount: 100n,
 *   to: '0xfeed...fede',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function mintSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: mintSync.Parameters<chain, account>,
): Promise<mintSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await mint.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = mint.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export namespace mintSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = mint.Parameters<chain, account>

  export type Args = mint.Args

  export type ReturnValue = Compute<
    GetEventArgs<
      typeof Abis.feeAmm,
      'Mint',
      { IndexedOnly: false; Required: true }
    > & {
      /** Transaction receipt. */
      receipt: TransactionReceipt
    }
  >
}

/**
 * Removes liquidity from a pool.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'tempo.ts/chains'
 * import { Actions } from 'tempo.ts/viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const hash = await Actions.amm.burn(client, {
 *   userToken: '0x20c0...beef',
 *   validatorToken: '0x20c0...babe',
 *   liquidity: 50n,
 *   to: '0xfeed...fede',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function burn<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: burn.Parameters<chain, account>,
): Promise<burn.ReturnValue> {
  return burn.inner(writeContract, client, parameters)
}

export namespace burn {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** Amount of LP tokens to burn. */
    liquidity: bigint
    /** Address to send tokens to. */
    to: Address
    /** Address or ID of the user token. */
    userToken: TokenId.TokenIdOrAddress
    /** Address or ID of the validator token. */
    validatorToken: TokenId.TokenIdOrAddress
  }

  export type ReturnValue = WriteContractReturnType

  /** @internal */
  export async function inner<
    action extends typeof writeContract | typeof writeContractSync,
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    action: action,
    client: Client<Transport, chain, account>,
    parameters: burn.Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const { liquidity, to, userToken, validatorToken, ...rest } = parameters
    const call = burn.call({ liquidity, to, userToken, validatorToken })
    return (await action(client, {
      ...rest,
      ...call,
    } as never)) as never
  }

  /**
   * Defines a call to the `burn` function.
   *
   * Can be passed as a parameter to:
   * - [`estimateContractGas`](https://viem.sh/docs/contract/estimateContractGas): estimate the gas cost of the call
   * - [`simulateContract`](https://viem.sh/docs/contract/simulateContract): simulate the call
   * - [`sendCalls`](https://viem.sh/docs/actions/wallet/sendCalls): send multiple calls
   *
   * @example
   * ```ts
   * import { createClient, http, walletActions } from 'viem'
   * import { tempo } from 'tempo.ts/chains'
   * import { Actions } from 'tempo.ts/viem'
   *
   * const client = createClient({
   *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
   *   transport: http(),
   * }).extend(walletActions)
   *
   * const { result } = await client.sendCalls({
   *   calls: [
   *     actions.amm.burn.call({
   *       liquidity: 100n,
   *       to: '0xfeed...fede',
   *       userToken: '0x20c0...beef',
   *       validatorToken: '0x20c0...babe',
   *     }),
   *     actions.amm.burn.call({
   *       liquidity: 100n,
   *       to: '0xfeed...fede',
   *       userToken: '0x20c0...babe',
   *       validatorToken: '0x20c0...babe',
   *     }),
   *   ]
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { liquidity, to, userToken, validatorToken } = args
    return defineCall({
      address: Addresses.feeManager,
      abi: Abis.feeAmm,
      functionName: 'burn',
      args: [
        TokenId.toAddress(userToken),
        TokenId.toAddress(validatorToken),
        liquidity,
        to,
      ],
    })
  }

  /**
   * Extracts the `Burn` event from logs.
   *
   * @param logs - The logs.
   * @returns The `Burn` event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.feeAmm,
      logs,
      eventName: 'Burn',
      strict: true,
    })
    if (!log) throw new Error('`Burn` event not found.')
    return log
  }
}

/**
 * Removes liquidity from a pool.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'tempo.ts/chains'
 * import { Actions } from 'tempo.ts/viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const result = await Actions.amm.burnSync(client, {
 *   userToken: '0x20c0...beef',
 *   validatorToken: '0x20c0...babe',
 *   liquidity: 50n,
 *   to: '0xfeed...fede',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function burnSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: burnSync.Parameters<chain, account>,
): Promise<burnSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await burn.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = burn.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export namespace burnSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = burn.Parameters<chain, account>

  export type Args = burn.Args

  export type ReturnValue = Compute<
    GetEventArgs<
      typeof Abis.feeAmm,
      'Burn',
      { IndexedOnly: false; Required: true }
    > & {
      /** Transaction receipt. */
      receipt: TransactionReceipt
    }
  >
}

/**
 * Watches for rebalance swap events.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'tempo.ts/chains'
 * import { Actions } from 'tempo.ts/viem'
 *
 * const client = createClient({
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const unwatch = actions.amm.watchRebalanceSwap(client, {
 *   onRebalanceSwap: (args, log) => {
 *     console.log('Rebalance swap:', args)
 *   },
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns A function to unsubscribe from the event.
 */
export function watchRebalanceSwap<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: watchRebalanceSwap.Parameters,
) {
  const { onRebalanceSwap, userToken, validatorToken, ...rest } = parameters
  return watchContractEvent(client, {
    ...rest,
    address: Addresses.feeManager,
    abi: Abis.feeAmm,
    eventName: 'RebalanceSwap',
    args:
      userToken !== undefined && validatorToken !== undefined
        ? {
            userToken: TokenId.toAddress(userToken),
            validatorToken: TokenId.toAddress(validatorToken),
          }
        : undefined,
    onLogs: (logs) => {
      for (const log of logs) onRebalanceSwap(log.args, log)
    },
    strict: true,
  })
}

export declare namespace watchRebalanceSwap {
  export type Args = GetEventArgs<
    typeof Abis.feeAmm,
    'RebalanceSwap',
    { IndexedOnly: false; Required: true }
  >

  export type Log = viem_Log<
    bigint,
    number,
    false,
    ExtractAbiItem<typeof Abis.feeAmm, 'RebalanceSwap'>,
    true
  >

  export type Parameters = UnionOmit<
    WatchContractEventParameters<typeof Abis.feeAmm, 'RebalanceSwap', true>,
    'abi' | 'address' | 'batch' | 'eventName' | 'onLogs' | 'strict'
  > & {
    /** Callback to invoke when a rebalance swap occurs. */
    onRebalanceSwap: (args: Args, log: Log) => void
    /** Address or ID of the user token to filter events. */
    userToken?: TokenId.TokenIdOrAddress | undefined
    /** Address or ID of the validator token to filter events. */
    validatorToken?: TokenId.TokenIdOrAddress | undefined
  }
}

/**
 * Watches for liquidity mint events.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'tempo.ts/chains'
 * import { Actions } from 'tempo.ts/viem'
 *
 * const client = createClient({
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const unwatch = actions.amm.watchMint(client, {
 *   onMint: (args, log) => {
 *     console.log('Liquidity added:', args)
 *   },
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns A function to unsubscribe from the event.
 */
export function watchMint<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(client: Client<Transport, chain, account>, parameters: watchMint.Parameters) {
  const { onMint, to, userToken, validatorToken, ...rest } = parameters
  return watchContractEvent(client, {
    ...rest,
    address: Addresses.feeManager,
    abi: Abis.feeAmm,
    eventName: 'Mint',
    args: {
      to,
      ...(userToken !== undefined && {
        userToken: TokenId.toAddress(userToken),
      }),
      ...(validatorToken !== undefined && {
        validatorToken: TokenId.toAddress(validatorToken),
      }),
    },
    onLogs: (logs) => {
      for (const log of logs) onMint(log.args, log)
    },
    strict: true,
  })
}

export declare namespace watchMint {
  export type Args = GetEventArgs<
    typeof Abis.feeAmm,
    'Mint',
    { IndexedOnly: false; Required: true }
  >

  export type Log = viem_Log<
    bigint,
    number,
    false,
    ExtractAbiItem<typeof Abis.feeAmm, 'Mint'>,
    true
  >

  export type Parameters = UnionOmit<
    WatchContractEventParameters<typeof Abis.feeAmm, 'Mint', true>,
    'abi' | 'address' | 'batch' | 'eventName' | 'onLogs' | 'strict'
  > & {
    /** Callback to invoke when liquidity is added. */
    onMint: (args: Args, log: Log) => void
    /** Address of the sender to filter events. */
    sender?: Address | undefined
    /** Address of the recipient to filter events. */
    to?: Address | undefined
    /** Address or ID of the user token to filter events. */
    userToken?: TokenId.TokenIdOrAddress | undefined
    /** Address or ID of the validator token to filter events. */
    validatorToken?: TokenId.TokenIdOrAddress | undefined
  }
}

/**
 * Watches for liquidity burn events.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'tempo.ts/chains'
 * import { Actions } from 'tempo.ts/viem'
 *
 * const client = createClient({
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const unwatch = actions.amm.watchBurn(client, {
 *   onBurn: (args, log) => {
 *     console.log('Liquidity removed:', args)
 *   },
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns A function to unsubscribe from the event.
 */
export function watchBurn<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(client: Client<Transport, chain, account>, parameters: watchBurn.Parameters) {
  const { onBurn, userToken, validatorToken, ...rest } = parameters
  return watchContractEvent(client, {
    ...rest,
    address: Addresses.feeManager,
    abi: Abis.feeAmm,
    eventName: 'Burn',
    args:
      userToken !== undefined && validatorToken !== undefined
        ? {
            userToken: TokenId.toAddress(userToken),
            validatorToken: TokenId.toAddress(validatorToken),
          }
        : undefined,
    onLogs: (logs) => {
      for (const log of logs) onBurn(log.args, log)
    },
    strict: true,
  })
}

export declare namespace watchBurn {
  export type Args = GetEventArgs<
    typeof Abis.feeAmm,
    'Burn',
    { IndexedOnly: false; Required: true }
  >

  export type Log = viem_Log<
    bigint,
    number,
    false,
    ExtractAbiItem<typeof Abis.feeAmm, 'Burn'>,
    true
  >

  export type Parameters = UnionOmit<
    WatchContractEventParameters<typeof Abis.feeAmm, 'Burn', true>,
    'abi' | 'address' | 'batch' | 'eventName' | 'onLogs' | 'strict'
  > & {
    /** Callback to invoke when liquidity is removed. */
    onBurn: (args: Args, log: Log) => void
    /** Address or ID of the user token to filter events. */
    userToken?: TokenId.TokenIdOrAddress | undefined
    /** Address or ID of the validator token to filter events. */
    validatorToken?: TokenId.TokenIdOrAddress | undefined
  }
}
