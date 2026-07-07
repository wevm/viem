import * as AbiEvent from 'ox/AbiEvent'
import type * as Errors from 'ox/Errors'
import * as Channel from 'ox/tempo/Channel'
import type * as Log from 'ox/Log'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { estimateGas as estimateContractGas } from '../../../core/actions/contract/estimateGas.js'
import { simulate as simulateContract } from '../../../core/actions/contract/simulate.js'
import { write } from '../../../core/actions/contract/write.js'
import type { writeSync } from '../../../core/actions/contract/writeSync.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'
import type { WriteParameters } from '../../internal/types.js'
import {
  type CallParameters,
  defineCall,
  pickWriteParameters,
  resolveCallParameters,
} from '../../internal/utils.js'

/**
 * Adds deposit to a TIP-20 channel reserve channel.
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
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /** @internal */
  export async function inner<
    action extends typeof write | typeof writeSync,
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    action: action,
    client: Client.Client<chain, account>,
    options: topUp.Options,
  ): Promise<ActionReturnType<action>> {
    return (await action(client, {
      ...options,
      ...topUp.call(client, options as never),
    } as never)) as never
  }

  /** Defines a call to the `topUp` function. */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [, args] = resolveCallParameters(parameters)
    const { additionalDeposit, channel } = args
    return defineCall({
      abi: Abis.tip20ChannelReserve,
      address: Addresses.tip20ChannelReserve,
      args: [Channel.from(channel), additionalDeposit],
      functionName: 'topUp',
    })
  }

  /** Estimates the gas required. */
  export async function estimateGas<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: topUp.Options,
  ): Promise<bigint> {
    return estimateContractGas(client, {
      ...pickWriteParameters(options as never),
      ...topUp.call(client, options as never),
    } as never)
  }

  /** Simulates the call. */
  export async function simulate<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: topUp.Options,
  ): Promise<
    simulateContract.ReturnType<typeof Abis.tip20ChannelReserve, 'topUp'>
  > {
    return simulateContract(client, {
      ...pickWriteParameters(options as never),
      ...topUp.call(client, options as never),
    } as never) as never
  }

  /** Extracts the `TopUp` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.tip20ChannelReserve, logs, {
      eventName: 'TopUp',
      strict: true,
    })
    if (!log) throw new Error('`TopUp` event not found.')
    return log
  }
}

type ActionReturnType<action> = action extends typeof writeSync
  ? writeSync.ReturnType
  : write.ReturnType
