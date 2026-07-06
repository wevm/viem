import * as AbiEvent from 'ox/AbiEvent'
import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'
import * as Hash from 'ox/Hash'
import * as Hex from 'ox/Hex'
import type * as Log from 'ox/Log'
import * as TokenId from 'ox/tempo/TokenId'

import type * as Account from '../../core/Account.js'
import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'
import { BaseError } from '../../core/Errors.js'
import { read } from '../../core/actions/contract/read.js'
import { watchEvent } from '../../core/actions/contract/watchEvent.js'
import { write } from '../../core/actions/contract/write.js'
import { writeSync } from '../../core/actions/contract/writeSync.js'
import type { OneOf } from '../../core/internal/types.js'
import * as Abis from '../Abis.js'
import * as Addresses from '../Addresses.js'
import type { ReadParameters, WriteParameters } from '../internal/types.js'
import { defineCall } from '../internal/utils.js'

/** Pool ids are directional (user then validator token). @internal */
function getPoolId(
  userToken: TokenId.TokenIdOrAddress,
  validatorToken: TokenId.TokenIdOrAddress,
) {
  return Hash.keccak256(
    Hex.concat(
      Hex.padLeft(TokenId.toAddress(userToken), 32),
      Hex.padLeft(TokenId.toAddress(validatorToken), 32),
    ),
  )
}

/**
 * Removes liquidity from a pool.
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
 * const hash = await Actions.amm.burn(client, {
 *   liquidity: 50n,
 *   to: '0x…',
 *   userToken: '0x…',
 *   validatorToken: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function burn<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: burn.Options,
): Promise<burn.ReturnType> {
  return burn.inner(write, client, options)
}

export namespace burn {
  export type Args = {
    /** Amount of LP tokens to burn. */
    liquidity: bigint
    /** Address to send tokens to. */
    to: Address.Address
    /** Address or ID of the user token. */
    userToken: TokenId.TokenIdOrAddress
    /** Address or ID of the validator token. */
    validatorToken: TokenId.TokenIdOrAddress
  }

  export type Options = WriteParameters & Args

  export type ReturnType = write.ReturnType

  export type ErrorType = write.ErrorType | Errors.GlobalErrorType

  /** @internal */
  export async function inner<action extends typeof write | typeof writeSync>(
    action: action,
    client: Client.Client,
    options: burn.Options,
  ): Promise<ActionReturnType<action>> {
    const { liquidity, to, userToken, validatorToken, ...rest } = options
    return (await action(client, {
      ...rest,
      ...burn.call({ liquidity, to, userToken, validatorToken }),
    } as never)) as never
  }

  /**
   * Defines a call to the `burn` function. Can be passed to any action that
   * accepts a contract call.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { liquidity, to, userToken, validatorToken } = args
    return defineCall({
      abi: Abis.feeAmm,
      address: Addresses.feeManager,
      args: [
        TokenId.toAddress(userToken),
        TokenId.toAddress(validatorToken),
        liquidity,
        to,
      ],
      functionName: 'burn',
    } as never)
  }

  /** Extracts the `Burn` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.feeAmm, logs, {
      eventName: 'Burn',
      strict: true,
    })
    if (!log) throw new BaseError('`Burn` event not found.')
    return log
  }
}

/**
 * Removes liquidity from a pool, and waits for the transaction to be
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
 * const { receipt, ...event } = await Actions.amm.burnSync(client, {
 *   liquidity: 50n,
 *   to: '0x…',
 *   userToken: '0x…',
 *   validatorToken: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function burnSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: burnSync.Options,
): Promise<burnSync.ReturnType<chain>> {
  const { throwOnReceiptRevert = true, ...rest } = options
  const receipt = await burn.inner(writeSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = burn.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export declare namespace burnSync {
  type Args = burn.Args

  type Options = burn.Options

  type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** Address that initiated the burn. */
    sender: Address.Address
    /** User token of the pool. */
    userToken: Address.Address
    /** Validator token of the pool. */
    validatorToken: Address.Address
    /** Amount of user token withdrawn. */
    amountUserToken: bigint
    /** Amount of validator token withdrawn. */
    amountValidatorToken: bigint
    /** Amount of LP tokens burned. */
    liquidity: bigint
    /** Address the withdrawn tokens were sent to. */
    to: Address.Address
    /** Transaction receipt. */
    receipt: writeSync.ReturnType<chain>
  }

  type ErrorType = writeSync.ErrorType | Errors.GlobalErrorType
}

/**
 * Gets the LP token balance for an account in a specific pool.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const balance = await Actions.amm.getLiquidityBalance(client, {
 *   address: '0x…',
 *   userToken: '0x…',
 *   validatorToken: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The LP token balance.
 */
export async function getLiquidityBalance<
  chain extends Chain.Chain | undefined,
>(
  client: Client.Client<chain>,
  options: getLiquidityBalance.Options,
): Promise<getLiquidityBalance.ReturnType> {
  const { address, poolId, userToken, validatorToken, ...rest } = options
  return (await read(client, {
    ...rest,
    ...getLiquidityBalance.call({
      address,
      poolId,
      userToken,
      validatorToken,
    } as never),
  } as never)) as getLiquidityBalance.ReturnType
}

export namespace getLiquidityBalance {
  export type Args = {
    /** Address to check balance for. */
    address: Address.Address
  } & OneOf<
    | {
        /** Pool ID. */
        poolId: Hex.Hex
      }
    | {
        /** Address or ID of the user token. */
        userToken: TokenId.TokenIdOrAddress
        /** Address or ID of the validator token. */
        validatorToken: TokenId.TokenIdOrAddress
      }
  >

  export type Options = ReadParameters & Args

  export type ReturnType = read.ReturnType<
    typeof Abis.feeAmm,
    'liquidityBalances'
  >

  export type ErrorType = BaseError | read.ErrorType | Errors.GlobalErrorType

  /**
   * Defines a call to the `liquidityBalances` function. Can be passed to any
   * action that accepts a contract call.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { address } = args
    const poolId = (() => {
      if ('poolId' in args && args.poolId) return args.poolId
      if ('userToken' in args && 'validatorToken' in args)
        return getPoolId(args.userToken, args.validatorToken)
      throw new BaseError(
        '`poolId`, or `userToken` and `validatorToken` must be provided.',
      )
    })()
    return defineCall({
      abi: Abis.feeAmm,
      address: Addresses.feeManager,
      args: [poolId, address],
      functionName: 'liquidityBalances',
    } as never)
  }
}

/**
 * Gets the reserves for a liquidity pool.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const pool = await Actions.amm.getPool(client, {
 *   userToken: '0x…',
 *   validatorToken: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The pool reserves.
 */
export async function getPool<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: getPool.Options,
): Promise<getPool.ReturnType> {
  const { userToken, validatorToken, ...rest } = options
  const [poolCall, totalSupplyCall] = getPool.calls({
    userToken,
    validatorToken,
  })
  const [pool, totalSupply] = (await Promise.all([
    read(client, { ...rest, ...poolCall } as never),
    read(client, { ...rest, ...totalSupplyCall } as never),
  ])) as [
    read.ReturnType<typeof Abis.feeAmm, 'getPool'>,
    read.ReturnType<typeof Abis.feeAmm, 'totalSupply'>,
  ]
  return {
    reserveUserToken: pool.reserveUserToken,
    reserveValidatorToken: pool.reserveValidatorToken,
    totalSupply,
  }
}

export namespace getPool {
  export type Args = {
    /** Address or ID of the user token. */
    userToken: TokenId.TokenIdOrAddress
    /** Address or ID of the validator token. */
    validatorToken: TokenId.TokenIdOrAddress
  }

  export type Options = ReadParameters & Args

  export type ReturnType = {
    /** Reserve of user token. */
    reserveUserToken: bigint
    /** Reserve of validator token. */
    reserveValidatorToken: bigint
    /** Total supply of LP tokens. */
    totalSupply: bigint
  }

  export type ErrorType = read.ErrorType | Errors.GlobalErrorType

  /**
   * Defines calls to the `getPool` and `totalSupply` functions. Can be passed
   * to any action that accepts contract calls.
   *
   * @param args - Arguments.
   * @returns The calls.
   */
  export function calls(args: Args) {
    const { userToken, validatorToken } = args
    return [
      defineCall({
        abi: Abis.feeAmm,
        address: Addresses.feeManager,
        args: [TokenId.toAddress(userToken), TokenId.toAddress(validatorToken)],
        functionName: 'getPool',
      } as never),
      defineCall({
        abi: Abis.feeAmm,
        address: Addresses.feeManager,
        args: [getPoolId(userToken, validatorToken)],
        functionName: 'totalSupply',
      } as never),
    ] as const
  }
}

/**
 * Adds liquidity to a pool.
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
 * const hash = await Actions.amm.mint(client, {
 *   to: '0x…',
 *   userTokenAddress: '0x…',
 *   validatorTokenAddress: '0x…',
 *   validatorTokenAmount: 100n,
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function mint<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: mint.Options,
): Promise<mint.ReturnType> {
  return mint.inner(write, client, options)
}

export namespace mint {
  export type Args = {
    /** Address to mint LP tokens to. */
    to: Address.Address
    /** Address or ID of the user token. */
    userTokenAddress: TokenId.TokenIdOrAddress
    /** Address or ID of the validator token. */
    validatorTokenAddress: TokenId.TokenIdOrAddress
    /** Amount of validator token to add. */
    validatorTokenAmount: bigint
  }

  export type Options = WriteParameters & Args

  export type ReturnType = write.ReturnType

  export type ErrorType = write.ErrorType | Errors.GlobalErrorType

  /** @internal */
  export async function inner<action extends typeof write | typeof writeSync>(
    action: action,
    client: Client.Client,
    options: mint.Options,
  ): Promise<ActionReturnType<action>> {
    const {
      to,
      userTokenAddress,
      validatorTokenAddress,
      validatorTokenAmount,
      ...rest
    } = options
    return (await action(client, {
      ...rest,
      ...mint.call({
        to,
        userTokenAddress,
        validatorTokenAddress,
        validatorTokenAmount,
      }),
    } as never)) as never
  }

  /**
   * Defines a call to the `mint` function. Can be passed to any action that
   * accepts a contract call.
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
      abi: Abis.feeAmm,
      address: Addresses.feeManager,
      args: [
        TokenId.toAddress(userTokenAddress),
        TokenId.toAddress(validatorTokenAddress),
        validatorTokenAmount,
        to,
      ],
      functionName: 'mint',
    } as never)
  }

  /** Extracts the `Mint` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.feeAmm, logs, {
      eventName: 'Mint',
      strict: true,
    })
    if (!log) throw new BaseError('`Mint` event not found.')
    return log
  }
}

/**
 * Adds liquidity to a pool, and waits for the transaction to be confirmed.
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
 * const { receipt, ...event } = await Actions.amm.mintSync(client, {
 *   to: '0x…',
 *   userTokenAddress: '0x…',
 *   validatorTokenAddress: '0x…',
 *   validatorTokenAmount: 100n,
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function mintSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: mintSync.Options,
): Promise<mintSync.ReturnType<chain>> {
  const { throwOnReceiptRevert = true, ...rest } = options
  const receipt = await mint.inner(writeSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = mint.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export declare namespace mintSync {
  type Args = mint.Args

  type Options = mint.Options

  type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** Address that initiated the mint. */
    sender: Address.Address
    /** Address the LP tokens were minted to. */
    to: Address.Address
    /** User token of the pool. */
    userToken: Address.Address
    /** Validator token of the pool. */
    validatorToken: Address.Address
    /** Amount of validator token added. */
    amountValidatorToken: bigint
    /** Amount of LP tokens minted. */
    liquidity: bigint
    /** Transaction receipt. */
    receipt: writeSync.ReturnType<chain>
  }

  type ErrorType = writeSync.ErrorType | Errors.GlobalErrorType
}

/**
 * Performs a rebalance swap from validator token to user token.
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
 * const hash = await Actions.amm.rebalanceSwap(client, {
 *   amountOut: 100n,
 *   to: '0x…',
 *   userToken: '0x…',
 *   validatorToken: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function rebalanceSwap<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: rebalanceSwap.Options,
): Promise<rebalanceSwap.ReturnType> {
  return rebalanceSwap.inner(write, client, options)
}

export namespace rebalanceSwap {
  export type Args = {
    /** Amount of user token to receive. */
    amountOut: bigint
    /** Address to send the user token to. */
    to: Address.Address
    /** Address or ID of the user token. */
    userToken: TokenId.TokenIdOrAddress
    /** Address or ID of the validator token. */
    validatorToken: TokenId.TokenIdOrAddress
  }

  export type Options = WriteParameters & Args

  export type ReturnType = write.ReturnType

  export type ErrorType = write.ErrorType | Errors.GlobalErrorType

  /** @internal */
  export async function inner<action extends typeof write | typeof writeSync>(
    action: action,
    client: Client.Client,
    options: rebalanceSwap.Options,
  ): Promise<ActionReturnType<action>> {
    const { amountOut, to, userToken, validatorToken, ...rest } = options
    return (await action(client, {
      ...rest,
      ...rebalanceSwap.call({ amountOut, to, userToken, validatorToken }),
    } as never)) as never
  }

  /**
   * Defines a call to the `rebalanceSwap` function. Can be passed to any
   * action that accepts a contract call.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { amountOut, to, userToken, validatorToken } = args
    return defineCall({
      abi: Abis.feeAmm,
      address: Addresses.feeManager,
      args: [
        TokenId.toAddress(userToken),
        TokenId.toAddress(validatorToken),
        amountOut,
        to,
      ],
      functionName: 'rebalanceSwap',
    } as never)
  }

  /** Extracts the `RebalanceSwap` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.feeAmm, logs, {
      eventName: 'RebalanceSwap',
      strict: true,
    })
    if (!log) throw new BaseError('`RebalanceSwap` event not found.')
    return log
  }
}

/**
 * Performs a rebalance swap from validator token to user token, and waits for
 * the transaction to be confirmed.
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
 * const { receipt, ...event } = await Actions.amm.rebalanceSwapSync(client, {
 *   amountOut: 100n,
 *   to: '0x…',
 *   userToken: '0x…',
 *   validatorToken: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function rebalanceSwapSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: rebalanceSwapSync.Options,
): Promise<rebalanceSwapSync.ReturnType<chain>> {
  const { throwOnReceiptRevert = true, ...rest } = options
  const receipt = await rebalanceSwap.inner(writeSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = rebalanceSwap.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export declare namespace rebalanceSwapSync {
  type Args = rebalanceSwap.Args

  type Options = rebalanceSwap.Options

  type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** User token of the pool. */
    userToken: Address.Address
    /** Validator token of the pool. */
    validatorToken: Address.Address
    /** Address that performed the swap. */
    swapper: Address.Address
    /** Amount of validator token paid in. */
    amountIn: bigint
    /** Amount of user token received. */
    amountOut: bigint
    /** Transaction receipt. */
    receipt: writeSync.ReturnType<chain>
  }

  type ErrorType = writeSync.ErrorType | Errors.GlobalErrorType
}

/**
 * Watches for liquidity burn events, returning a watcher handle.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const watcher = Actions.amm.watchBurn(client)
 * watcher.onLogs((logs) => console.log(logs))
 * // later: watcher.off()
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The watcher handle.
 */
export function watchBurn(
  client: Client.Client,
  options: watchBurn.Options = {},
): watchBurn.ReturnType {
  const { userToken, validatorToken, ...rest } = options
  return watchEvent(client, {
    ...rest,
    abi: Abis.feeAmm,
    address: Addresses.feeManager,
    args:
      userToken !== undefined && validatorToken !== undefined
        ? {
            userToken: TokenId.toAddress(userToken),
            validatorToken: TokenId.toAddress(validatorToken),
          }
        : undefined,
    eventName: 'Burn',
    strict: true,
  } as never) as watchBurn.ReturnType
}

export declare namespace watchBurn {
  type Options = Omit<
    watchEvent.Options,
    'abi' | 'address' | 'args' | 'eventName' | 'strict'
  > & {
    /** Address or ID of the user token to filter events. */
    userToken?: TokenId.TokenIdOrAddress | undefined
    /** Address or ID of the validator token to filter events. */
    validatorToken?: TokenId.TokenIdOrAddress | undefined
  }

  type ReturnType = watchEvent.Watcher<typeof Abis.feeAmm, 'Burn', true>

  type ErrorType = watchEvent.ErrorType | Errors.GlobalErrorType
}

/**
 * Watches for liquidity mint events, returning a watcher handle.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const watcher = Actions.amm.watchMint(client)
 * watcher.onLogs((logs) => console.log(logs))
 * // later: watcher.off()
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The watcher handle.
 */
export function watchMint(
  client: Client.Client,
  options: watchMint.Options = {},
): watchMint.ReturnType {
  const { to, userToken, validatorToken, ...rest } = options
  return watchEvent(client, {
    ...rest,
    abi: Abis.feeAmm,
    address: Addresses.feeManager,
    args: {
      ...(to !== undefined ? { to } : {}),
      ...(userToken !== undefined
        ? { userToken: TokenId.toAddress(userToken) }
        : {}),
      ...(validatorToken !== undefined
        ? { validatorToken: TokenId.toAddress(validatorToken) }
        : {}),
    },
    eventName: 'Mint',
    strict: true,
  } as never) as watchMint.ReturnType
}

export declare namespace watchMint {
  type Options = Omit<
    watchEvent.Options,
    'abi' | 'address' | 'args' | 'eventName' | 'strict'
  > & {
    /** Address of the recipient to filter events. */
    to?: Address.Address | undefined
    /** Address or ID of the user token to filter events. */
    userToken?: TokenId.TokenIdOrAddress | undefined
    /** Address or ID of the validator token to filter events. */
    validatorToken?: TokenId.TokenIdOrAddress | undefined
  }

  type ReturnType = watchEvent.Watcher<typeof Abis.feeAmm, 'Mint', true>

  type ErrorType = watchEvent.ErrorType | Errors.GlobalErrorType
}

/**
 * Watches for rebalance swap events, returning a watcher handle.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const watcher = Actions.amm.watchRebalanceSwap(client)
 * watcher.onLogs((logs) => console.log(logs))
 * // later: watcher.off()
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The watcher handle.
 */
export function watchRebalanceSwap(
  client: Client.Client,
  options: watchRebalanceSwap.Options = {},
): watchRebalanceSwap.ReturnType {
  const { userToken, validatorToken, ...rest } = options
  return watchEvent(client, {
    ...rest,
    abi: Abis.feeAmm,
    address: Addresses.feeManager,
    args:
      userToken !== undefined && validatorToken !== undefined
        ? {
            userToken: TokenId.toAddress(userToken),
            validatorToken: TokenId.toAddress(validatorToken),
          }
        : undefined,
    eventName: 'RebalanceSwap',
    strict: true,
  } as never) as watchRebalanceSwap.ReturnType
}

export declare namespace watchRebalanceSwap {
  type Options = Omit<
    watchEvent.Options,
    'abi' | 'address' | 'args' | 'eventName' | 'strict'
  > & {
    /** Address or ID of the user token to filter events. */
    userToken?: TokenId.TokenIdOrAddress | undefined
    /** Address or ID of the validator token to filter events. */
    validatorToken?: TokenId.TokenIdOrAddress | undefined
  }

  type ReturnType = watchEvent.Watcher<
    typeof Abis.feeAmm,
    'RebalanceSwap',
    true
  >

  type ErrorType = watchEvent.ErrorType | Errors.GlobalErrorType
}

/** The awaited return type of a contract write action. @internal */
type ActionReturnType<action extends (...args: never[]) => unknown> = Awaited<
  ReturnType<action>
>
