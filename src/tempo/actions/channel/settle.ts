import { AbiEvent } from 'ox'
import type { Errors, Hex, Log } from 'ox'
import { Channel } from 'ox/tempo'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import type { simulate as simulateContract } from '../../../core/actions/contract/simulate.js'
import { write } from '../../../core/actions/contract/write.js'
import type { writeSync } from '../../../core/actions/contract/writeSync.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'
import type { WriteParameters } from '../../internal/types.js'
import {
  type CallParameters,
  defineCall,
  dispatchWrite,
  estimateWrite,
  pickWriteParameters,
  resolveCallParameters,
  simulateWrite,
} from '../../internal/utils.js'

/**
 * Settles a TIP-20 channel reserve voucher.
 */
export async function settle<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: settle.Options,
): Promise<settle.ReturnType> {
  return settle.inner(write, client, options)
}

export namespace settle {
  export type Args = {
    /** Total voucher amount signed for the channel. */
    cumulativeAmount: bigint
    /** TIP-20 channel. */
    channel: Channel.from.Value
    /** Voucher signature. */
    signature: Hex.Hex
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
    options: settle.Options,
  ): Promise<dispatchWrite.ReturnType<action>> {
    // Keep call arguments (notably `signature`, which collides with the
    // transaction signature field) out of the write request.
    const { channel, cumulativeAmount, signature, ...rest } = options
    return dispatchWrite(action, client, {
      ...rest,
      ...settle.call(client, {
        channel,
        cumulativeAmount,
        signature,
      }),
    })
  }

  /** Defines a call to the `settle` function. */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [, args] = resolveCallParameters(parameters)
    const { cumulativeAmount, channel, signature } = args
    return defineCall({
      abi: Abis.tip20ChannelReserve,
      address: Addresses.tip20ChannelReserve,
      args: [Channel.from(channel), cumulativeAmount, signature],
      functionName: 'settle',
    })
  }

  /** Estimates the gas required. */
  export async function estimateGas<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: settle.Options,
  ): Promise<bigint> {
    return estimateWrite(client, {
      ...pickWriteParameters(options),
      ...settle.call(client, options),
    })
  }

  /** Simulates the call. */
  export async function simulate<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: settle.Options,
  ): Promise<
    simulateContract.ReturnType<typeof Abis.tip20ChannelReserve, 'settle'>
  > {
    return simulateWrite(client, {
      ...pickWriteParameters(options),
      ...settle.call(client, options),
    })
  }

  /** Extracts the `Settled` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.tip20ChannelReserve, logs, {
      eventName: 'Settled',
      strict: true,
    })
    if (!log) throw new Error('`Settled` event not found.')
    return log
  }
}
