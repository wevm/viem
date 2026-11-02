import { Address } from 'ox'
import type { Channel } from 'ox/tempo'

import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'
import { TempoExecutionError } from '../../errors.js'
import {
  type Context,
  formatTime,
  type Resolvers,
} from '../../internal/errors.js'

/** Errors this module throws for decoded Tempo errors. Narrow with `error.name`. */
export type ExecutionErrorType =
  | ChannelAmountExceedsDepositErrorType
  | ChannelAmountNotIncreasingErrorType
  | ChannelCloseNotReadyErrorType
  | ChannelNotFoundErrorType

/** `ChannelNotFoundError` with a literal `name`, for narrowing. */
export type ChannelNotFoundErrorType = ChannelNotFoundError & {
  name: 'ChannelNotFoundError'
}

/** Thrown when a payment channel does not exist. */
export class ChannelNotFoundError extends TempoExecutionError<
  TempoExecutionError.Decoded<'ChannelNotFound'>
> {
  /** Channel descriptor, when known. */
  descriptor: Channel.Channel | undefined

  constructor(
    parameters: TempoExecutionError.Parameters & {
      descriptor?: Channel.Channel | undefined
    },
  ) {
    const { descriptor } = parameters
    super(parameters, {
      details: {
        payer: descriptor?.payer,
        payee: descriptor?.payee,
        token: descriptor?.token,
      },
      name: 'ChannelNotFoundError',
    })
    this.descriptor = descriptor
  }
}

/** `ChannelCloseNotReadyError` with a literal `name`, for narrowing. */
export type ChannelCloseNotReadyErrorType = ChannelCloseNotReadyError & {
  name: 'ChannelCloseNotReadyError'
}

/** Thrown when withdrawing from a channel before its close grace period ends. */
export class ChannelCloseNotReadyError extends TempoExecutionError<
  TempoExecutionError.Decoded<'CloseNotReady'>
> {
  /** When the close was requested (Unix seconds), or `0` when it was not. */
  closeRequestedAt: number | undefined
  /** When the channel can be withdrawn from (Unix seconds), when known. */
  readyAt: bigint | undefined

  constructor(
    parameters: TempoExecutionError.Parameters & {
      closeRequestedAt?: number | undefined
      readyAt?: bigint | undefined
    },
  ) {
    const { closeRequestedAt, readyAt } = parameters
    super(parameters, {
      details: {
        'close requested at': formatTime(closeRequestedAt),
        'ready at': formatTime(readyAt),
      },
      name: 'ChannelCloseNotReadyError',
      shortMessage:
        closeRequestedAt === 0
          ? 'Channel close has not been requested.'
          : readyAt
            ? `Channel is not ready to close until ${formatTime(readyAt)}.`
            : undefined,
    })
    this.closeRequestedAt = closeRequestedAt
    this.readyAt = readyAt
  }
}

/** `ChannelAmountExceedsDepositError` with a literal `name`, for narrowing. */
export type ChannelAmountExceedsDepositErrorType =
  ChannelAmountExceedsDepositError & {
    name: 'ChannelAmountExceedsDepositError'
  }

/** Thrown when a voucher amount exceeds the channel deposit. */
export class ChannelAmountExceedsDepositError extends TempoExecutionError<
  TempoExecutionError.Decoded<'AmountExceedsDeposit'>
> {
  /** Cumulative voucher amount. */
  amount: bigint | undefined
  /** Channel deposit, when known. */
  deposit: bigint | undefined

  constructor(
    parameters: TempoExecutionError.Parameters & {
      amount?: bigint | undefined
      deposit?: bigint | undefined
    },
  ) {
    const { amount, deposit } = parameters
    super(parameters, {
      details: { amount, deposit },
      name: 'ChannelAmountExceedsDepositError',
    })
    this.amount = amount
    this.deposit = deposit
  }
}

/** `ChannelAmountNotIncreasingError` with a literal `name`, for narrowing. */
export type ChannelAmountNotIncreasingErrorType =
  ChannelAmountNotIncreasingError & {
    name: 'ChannelAmountNotIncreasingError'
  }

/** Thrown when a voucher amount is not above the amount already settled. */
export class ChannelAmountNotIncreasingError extends TempoExecutionError<
  TempoExecutionError.Decoded<'AmountNotIncreasing'>
> {
  /** Cumulative voucher amount. */
  amount: bigint | undefined
  /** Amount already settled, when known. */
  settled: bigint | undefined

  constructor(
    parameters: TempoExecutionError.Parameters & {
      amount?: bigint | undefined
      settled?: bigint | undefined
    },
  ) {
    const { amount, settled } = parameters
    super(parameters, {
      details: { amount, settled },
      name: 'ChannelAmountNotIncreasingError',
    })
    this.amount = amount
    this.settled = settled
  }
}

const reserve = {
  address: Addresses.tip20ChannelReserve,
  abi: Abis.tip20ChannelReserve,
} as const

/** Reads the channel state of the failed call, when it targets the channel reserve. */
async function readChannel(context: Context) {
  const { call } = context
  if (!call || !Address.isEqual(call.address, Addresses.tip20ChannelReserve))
    return undefined
  const descriptor = call.arg<Channel.Channel>('descriptor')
  if (!descriptor) return { call }
  const [channel, gracePeriod] = await Promise.all([
    context.read({
      ...reserve,
      functionName: 'getChannel',
      args: [descriptor],
    }),
    context.read({ ...reserve, functionName: 'CLOSE_GRACE_PERIOD' }),
  ])
  return { call, gracePeriod, state: channel?.state }
}

/** @internal */
export const errorResolvers: Resolvers = {
  'AmountExceedsDeposit()': async (context) => {
    const channel = await readChannel(context)
    if (!channel) return undefined
    return new ChannelAmountExceedsDepositError({
      ...context.base,
      amount: channel.call.arg<bigint>('cumulativeAmount'),
      deposit: channel.state?.deposit,
    })
  },
  'AmountNotIncreasing()': async (context) => {
    const channel = await readChannel(context)
    if (!channel) return undefined
    return new ChannelAmountNotIncreasingError({
      ...context.base,
      amount: channel.call.arg<bigint>('cumulativeAmount'),
      settled: channel.state?.settled,
    })
  },
  'ChannelNotFound()': (context) => {
    const { call } = context
    if (!call || !Address.isEqual(call.address, Addresses.tip20ChannelReserve))
      return undefined
    return new ChannelNotFoundError({
      ...context.base,
      descriptor: call.arg<Channel.Channel>('descriptor'),
    })
  },
  'CloseNotReady()': async (context) => {
    const channel = await readChannel(context)
    if (!channel) return undefined
    const closeRequestedAt = channel.state?.closeRequestedAt
    return new ChannelCloseNotReadyError({
      ...context.base,
      closeRequestedAt,
      readyAt:
        closeRequestedAt && channel.gracePeriod !== undefined
          ? BigInt(closeRequestedAt) + channel.gracePeriod
          : undefined,
    })
  },
}
