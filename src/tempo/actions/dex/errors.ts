import { Address } from 'ox'

import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'
import { TempoExecutionError } from '../../errors.js'
import type { Context, Resolvers } from '../../internal/errors.js'

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
  TempoExecutionError.Decoded<'InsufficientOutput'>
> {
  /** Amount of `tokenIn` to sell. */
  amountIn: bigint | undefined
  /** Minimum amount of `tokenOut` to receive. */
  minAmountOut: bigint | undefined
  /** Current quote for `amountIn`, when available. */
  quote: bigint | undefined
  /** Token to sell. */
  tokenIn: Address.Address | undefined
  /** Token to buy. */
  tokenOut: Address.Address | undefined

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
  type Parameters = TempoExecutionError.Parameters & {
    /** Amount of `tokenIn` to sell. */
    amountIn?: bigint | undefined
    /** Minimum amount of `tokenOut` to receive. */
    minAmountOut?: bigint | undefined
    /** Current quote for `amountIn`, when available. */
    quote?: bigint | undefined
    /** Token to sell. */
    tokenIn?: Address.Address | undefined
    /** Token to buy. */
    tokenOut?: Address.Address | undefined
  }
}

/** `DexMaxInputExceededError` with a literal `name`, for narrowing. */
export type DexMaxInputExceededErrorType = DexMaxInputExceededError & {
  name: 'DexMaxInputExceededError'
}

/** Thrown when a buy would cost more than `maxAmountIn`. */
export class DexMaxInputExceededError extends TempoExecutionError<
  TempoExecutionError.Decoded<'MaxInputExceeded'>
> {
  /** Amount of `tokenOut` to buy. */
  amountOut: bigint | undefined
  /** Maximum amount of `tokenIn` to spend. */
  maxAmountIn: bigint | undefined
  /** Current cost of `amountOut`, when available. */
  quote: bigint | undefined
  /** Token to spend. */
  tokenIn: Address.Address | undefined
  /** Token to buy. */
  tokenOut: Address.Address | undefined

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
  type Parameters = TempoExecutionError.Parameters & {
    /** Amount of `tokenOut` to buy. */
    amountOut?: bigint | undefined
    /** Maximum amount of `tokenIn` to spend. */
    maxAmountIn?: bigint | undefined
    /** Current cost of `amountOut`, when available. */
    quote?: bigint | undefined
    /** Token to spend. */
    tokenIn?: Address.Address | undefined
    /** Token to buy. */
    tokenOut?: Address.Address | undefined
  }
}

/** `DexInsufficientLiquidityError` with a literal `name`, for narrowing. */
export type DexInsufficientLiquidityErrorType =
  DexInsufficientLiquidityError & { name: 'DexInsufficientLiquidityError' }

/** Thrown when the order book cannot fill a swap. */
export class DexInsufficientLiquidityError extends TempoExecutionError<
  TempoExecutionError.Decoded<'InsufficientLiquidity'>
> {
  /** Amount of `tokenIn` to sell, for sells. */
  amountIn: bigint | undefined
  /** Amount of `tokenOut` to buy, for buys. */
  amountOut: bigint | undefined
  /** Token to spend. */
  tokenIn: Address.Address | undefined
  /** Token to buy. */
  tokenOut: Address.Address | undefined

  constructor(
    parameters: TempoExecutionError.Parameters & {
      amountIn?: bigint | undefined
      amountOut?: bigint | undefined
      tokenIn?: Address.Address | undefined
      tokenOut?: Address.Address | undefined
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
  TempoExecutionError.Decoded<'BelowMinimumOrderSize'>
> {
  /** Order amount. */
  amount: bigint
  /** Minimum order amount, when known. */
  minimum: bigint | undefined

  constructor(
    parameters: TempoExecutionError.Parameters & {
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
  TempoExecutionError.Decoded<'TickOutOfBounds'>
> {
  /** Highest allowed tick, when known. */
  maxTick: number | undefined
  /** Lowest allowed tick, when known. */
  minTick: number | undefined
  /** Tick that is out of range. */
  tick: number

  constructor(
    parameters: TempoExecutionError.Parameters & {
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
  TempoExecutionError.Decoded<'InvalidFlipTick'>
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
    parameters: TempoExecutionError.Parameters & {
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
  TempoExecutionError.Decoded<'OrderDoesNotExist'>
> {
  /** Order ID. */
  orderId: bigint

  constructor(
    parameters: TempoExecutionError.Parameters & { orderId: bigint },
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
  TempoExecutionError.Decoded<'OrderNotStale'>
> {
  /** Order ID. */
  orderId: bigint

  constructor(
    parameters: TempoExecutionError.Parameters & { orderId: bigint },
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
  TempoExecutionError.Decoded<'PairDoesNotExist'>
> {
  /** Tokens of the call. */
  tokens: readonly Address.Address[]

  constructor(
    parameters: TempoExecutionError.Parameters & {
      tokens: readonly Address.Address[]
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
  TempoExecutionError.Decoded<'InsufficientBalance'>
> {
  /** Amount to withdraw. */
  amount: bigint | undefined
  /** Exchange balance, when known. */
  balance: bigint | undefined
  /** Token address. */
  token: Address.Address

  constructor(
    parameters: TempoExecutionError.Parameters & {
      amount?: bigint | undefined
      balance?: bigint | undefined
      token: Address.Address
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
  return call && Address.isEqual(call.address, Addresses.stablecoinDex)
    ? call
    : undefined
}

/** @internal */
export const errorResolvers: Resolvers = {
  'BelowMinimumOrderSize(uint128)': async (context) => {
    if (!getExchangeCall(context) || !context.base.error.args) return undefined
    const minimum = await context.read({
      ...exchange,
      functionName: 'MIN_ORDER_AMOUNT',
    })
    return new DexBelowMinimumOrderSizeError({ ...context.base, minimum })
  },
  'InsufficientBalance()': async (context) => {
    const call = getExchangeCall(context)
    const token = call?.arg<Address.Address>('token')
    if (call?.functionName !== 'withdraw' || !token || !context.signer)
      return undefined
    const balance = await context.read({
      ...exchange,
      functionName: 'balanceOf',
      args: [context.signer.address, token],
    })
    return new DexInsufficientBalanceError({
      ...context.base,
      amount: call.arg<bigint>('amount'),
      balance,
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
      tokenIn: call.arg<Address.Address>('tokenIn'),
      tokenOut: call.arg<Address.Address>('tokenOut'),
    })
  },
  'InsufficientOutput()': async (context) => {
    const call = getExchangeCall(context)
    const tokenIn = call?.arg<Address.Address>('tokenIn')
    const tokenOut = call?.arg<Address.Address>('tokenOut')
    const amountIn = call?.arg<bigint>('amountIn')
    if (!call || !tokenIn || !tokenOut || amountIn === undefined)
      return undefined
    const quote = await context.read({
      ...exchange,
      functionName: 'quoteSwapExactAmountIn',
      args: [tokenIn, tokenOut, amountIn],
    })
    return new DexInsufficientOutputError({
      ...context.base,
      amountIn,
      minAmountOut: call.arg<bigint>('minAmountOut'),
      quote,
      tokenIn,
      tokenOut,
    })
  },
  'InvalidFlipTick()': async (context) => {
    const call = getExchangeCall(context)
    if (!call) return undefined
    const tickSpacing = await context.read({
      ...exchange,
      functionName: 'TICK_SPACING',
    })
    const isBid = call.arg<boolean>('isBid')
    return new DexInvalidFlipTickError({
      ...context.base,
      flipTick: call.arg<number>('flipTick'),
      side: isBid === undefined ? undefined : isBid ? 'buy' : 'sell',
      tick: call.arg<number>('tick'),
      tickSpacing,
    })
  },
  'MaxInputExceeded()': async (context) => {
    const call = getExchangeCall(context)
    const tokenIn = call?.arg<Address.Address>('tokenIn')
    const tokenOut = call?.arg<Address.Address>('tokenOut')
    const amountOut = call?.arg<bigint>('amountOut')
    if (!call || !tokenIn || !tokenOut || amountOut === undefined)
      return undefined
    const quote = await context.read({
      ...exchange,
      functionName: 'quoteSwapExactAmountOut',
      args: [tokenIn, tokenOut, amountOut],
    })
    return new DexMaxInputExceededError({
      ...context.base,
      amountOut,
      maxAmountIn: call.arg<bigint>('maxAmountIn'),
      quote,
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
      const token = call.arg<Address.Address>(name)
      return token ? [token] : []
    })
    return new DexPairNotFoundError({ ...context.base, tokens })
  },
  'TickOutOfBounds(int16)': async (context) => {
    if (!getExchangeCall(context) || !context.base.error.args) return undefined
    const [minTick, maxTick] = await Promise.all([
      context.read({ ...exchange, functionName: 'MIN_TICK' }),
      context.read({ ...exchange, functionName: 'MAX_TICK' }),
    ])
    return new DexTickOutOfBoundsError({ ...context.base, maxTick, minTick })
  },
}
