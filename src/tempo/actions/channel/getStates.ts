import type { Errors, Hex } from 'ox'
import { Channel } from 'ox/tempo'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { read } from '../../../core/actions/contract/read.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'
import type { ReadParameters } from '../../internal/types.js'
import {
  type CallParameters,
  defineCall,
  resolveCallParameters,
} from '../../internal/utils.js'

/**
 * Gets TIP-20 channel reserve state for a channel ID or channel.
 */
export async function getStates<
  chain extends Chain.Chain | undefined,
  const channel extends getStates.Channel | readonly getStates.Channel[],
>(
  client: Client.Client<chain>,
  options: getStates.Options<channel>,
): Promise<getStates.ReturnType<channel>> {
  const { channel, ...rest } = options
  const chainId = client.chain?.id
  // The single/batch contract call is selected from the input arity; the
  // conditional return type cannot be derived from the branch union.
  const state = Array.isArray(channel)
    ? await read(client, {
        ...rest,
        abi: Abis.tip20ChannelReserve,
        address: Addresses.tip20ChannelReserve,
        args: [
          (channel as readonly getStates.Channel[]).map((channel) =>
            resolveChannelId(channel, chainId),
          ),
        ],
        functionName: 'getChannelStatesBatch',
      })
    : await read(client, {
        ...rest,
        abi: Abis.tip20ChannelReserve,
        address: Addresses.tip20ChannelReserve,
        args: [resolveChannelId(channel as getStates.Channel, chainId)],
        functionName: 'getChannelState',
      })
  return state as getStates.ReturnType<channel>
}

export namespace getStates {
  export type Options<
    channel extends Channel | readonly Channel[] = Channel | readonly Channel[],
  > = Omit<ReadParameters, 'account'> & {
    /** Channel ID, channel, or list of IDs and channels. */
    channel: channel
  }
  export type Args<
    channel extends Channel | readonly Channel[] = Channel | readonly Channel[],
  > = {
    /** Chain ID used to compute IDs for channel inputs. */
    chainId?: number | undefined
    /** Channel ID, channel, or list of IDs and channels. */
    channel: channel
  }
  export type Channel = Hex.Hex | import('ox/tempo/Channel').from.Value
  export type State = {
    settled: bigint
    deposit: bigint
    closeRequestedAt: number
  }
  export type ReturnType<channel extends Channel | readonly Channel[]> =
    channel extends readonly Channel[] ? readonly State[] : State
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /** Defines a call to the `getChannelState` or `getChannelStatesBatch` function. */
  export function call<const channel extends Channel | readonly Channel[]>(
    ...parameters: CallParameters<Args<channel>>
  ) {
    const [, args] = resolveCallParameters(parameters)
    const { channel, chainId } = args
    if (Array.isArray(channel))
      return defineCall({
        abi: Abis.tip20ChannelReserve,
        address: Addresses.tip20ChannelReserve,
        args: [
          (channel as readonly Channel[]).map((channel) =>
            resolveChannelId(channel, chainId),
          ),
        ],
        functionName: 'getChannelStatesBatch',
      })

    return defineCall({
      abi: Abis.tip20ChannelReserve,
      address: Addresses.tip20ChannelReserve,
      args: [resolveChannelId(channel as Channel, chainId)],
      functionName: 'getChannelState',
    })
  }
}

/** Resolves a channel input (id or channel value) to its channel id. @internal */
function resolveChannelId(
  channel: getStates.Channel,
  chainId: number | undefined,
): Hex.Hex {
  if (typeof channel === 'string') return channel
  if (chainId === undefined)
    throw new Error('`chainId` is required for channel inputs.')
  return Channel.computeId(channel, { chainId })
}
