import { Channel as OxChannel } from 'ox/tempo'
import type { ReadContractReturnType } from '../../actions/public/readContract.js'
import { readContract } from '../../actions/public/readContract.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { BaseErrorType } from '../../errors/base.js'
import type { Chain } from '../../types/chain.js'
import type { Hex } from '../../types/misc.js'
import * as Abis from '../Abis.js'
import type { ReadParameters } from '../internal/types.js'
import { defineCall } from '../internal/utils.js'

/**
 * Gets TIP-20 channel reserve state for a channel ID or descriptor.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' }),
 *   transport: http(),
 * })
 *
 * const state = await Actions.channel.getStates(client, {
 *   channel: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns Channel state for a single channel, or channel states for multiple channels.
 */
export async function getStates<
  chain extends Chain | undefined,
  const channel extends getStates.Channel | readonly getStates.Channel[],
>(
  client: Client<Transport, chain>,
  parameters: getStates.Parameters<channel>,
): Promise<getStates.ReturnValue<channel>> {
  const chainId = client.chain?.id
  const { channel, ...rest } = parameters

  return readContract(client, {
    ...rest,
    ...getStates.call({ channel, chainId } as never),
  } as never) as never
}

export namespace getStates {
  export type Parameters<
    channel extends Channel | readonly Channel[] = Channel | readonly Channel[],
  > = ReadParameters & {
    /** Channel ID, descriptor, or list of IDs and descriptors. */
    channel: channel
  }

  export type Args<
    channel extends Channel | readonly Channel[] = Channel | readonly Channel[],
  > = {
    /**
     * Chain ID used to compute IDs for descriptor inputs.
     *
     * Required for descriptor inputs when using `getStates.call` directly.
     */
    chainId?: number | undefined
    /** Channel ID, descriptor, or list of IDs and descriptors. */
    channel: channel
  }

  export type Channel = Hex | OxChannel.Descriptor

  export type State = ReadContractReturnType<
    typeof Abis.tip20ChannelReserve,
    'getChannelState',
    readonly [Hex]
  >

  export type ReturnValue<channel extends Channel | readonly Channel[]> =
    channel extends readonly Channel[] ? readonly State[] : State

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType

  /**
   * Defines a call to the `getChannelState` or `getChannelStatesBatch` function.
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
   *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' }),
   *   transport: http(),
   * }).extend(walletActions)
   *
   * const calls = [Actions.channel.getStates.call({ channel: '0x...' })]
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call<const channel extends Channel | readonly Channel[]>(
    args: Args<channel>,
  ) {
    const { channel, chainId } = args
    if (Array.isArray(channel))
      return defineCall({
        address: OxChannel.address,
        abi: Abis.tip20ChannelReserve,
        args: [
          (channel as readonly Channel[]).map((channel) => {
            if (typeof channel === 'string') return channel
            if (chainId === undefined)
              throw new Error('`chainId` is required for descriptor inputs.')
            return OxChannel.computeId({ ...channel, chainId }) as Hex
          }),
        ],
        functionName: 'getChannelStatesBatch',
      })

    const channel_ = channel as Channel
    if (typeof channel_ === 'string')
      return defineCall({
        address: OxChannel.address,
        abi: Abis.tip20ChannelReserve,
        args: [channel_],
        functionName: 'getChannelState',
      })

    if (chainId === undefined)
      throw new Error('`chainId` is required for descriptor inputs.')

    return defineCall({
      address: OxChannel.address,
      abi: Abis.tip20ChannelReserve,
      args: [OxChannel.computeId({ ...channel_, chainId }) as Hex],
      functionName: 'getChannelState',
    })
  }
}
