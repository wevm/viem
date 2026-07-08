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
 * Closes a TIP-20 channel reserve channel from the payee or operator side.
 *
 * @example
 * ```ts
 * import { Account, Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromSecp256k1('0x…'),
 *   transport: http(),
 * })
 *
 * const hash = await Actions.channel.close(client, {
 *   captureAmount: 100n,
 *   cumulativeAmount: 100n,
 *   channel,
 *   signature: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function close<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: close.Options,
): Promise<close.ReturnType> {
  return close.inner(write, client, options)
}

export namespace close {
  export type Args = {
    /** Amount to capture for the payee during close. */
    captureAmount: bigint
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
    options: close.Options,
  ): Promise<dispatchWrite.ReturnType<action>> {
    // Keep call arguments (notably `signature`, which collides with the
    // transaction signature field) out of the write request.
    const { captureAmount, channel, cumulativeAmount, signature, ...rest } =
      options
    return dispatchWrite(action, client, {
      ...rest,
      ...close.call({ captureAmount, channel, cumulativeAmount, signature }),
    })
  }

  /**
   * Defines a call to the `close` function.
   *
   * Can be passed to any action that accepts a contract call.
   *
   * @param parameters - Client (optional), followed by the call arguments.
   * @returns The call.
   */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [, args] = resolveCallParameters(parameters)
    const { captureAmount, cumulativeAmount, channel, signature } = args
    return defineCall({
      abi: Abis.tip20ChannelReserve,
      address: Addresses.tip20ChannelReserve,
      args: [Channel.from(channel), cumulativeAmount, captureAmount, signature],
      functionName: 'close',
    })
  }

  /** Estimates the gas required to close a TIP-20 channel reserve channel. */
  export async function estimateGas<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: close.Options,
  ): Promise<bigint> {
    return estimateWrite(client, {
      ...pickWriteParameters(options),
      ...close.call(options),
    })
  }

  /** Simulates closing a TIP-20 channel reserve channel. */
  export async function simulate<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: close.Options,
  ): Promise<
    simulateContract.ReturnType<typeof Abis.tip20ChannelReserve, 'close'>
  > {
    return simulateWrite(client, {
      ...pickWriteParameters(options),
      ...close.call(options),
    })
  }

  /** Extracts the `ChannelClosed` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.tip20ChannelReserve, logs, {
      eventName: 'ChannelClosed',
      strict: true,
    })
    if (!log) throw new Error('`ChannelClosed` event not found.')
    return log
  }
}
