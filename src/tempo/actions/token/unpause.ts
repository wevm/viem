import * as AbiEvent from 'ox/AbiEvent'
import type * as Errors from 'ox/Errors'
import type * as Log from 'ox/Log'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import type { simulate as simulateContract } from '../../../core/actions/contract/simulate.js'
import { write } from '../../../core/actions/contract/write.js'
import type { writeSync } from '../../../core/actions/contract/writeSync.js'
import * as Abis from '../../Abis.js'
import type { TokenParameter, WriteParameters } from '../../internal/types.js'
import {
  type CallParameters,
  defineCall,
  dispatchWrite,
  estimateWrite,
  pickWriteParameters,
  resolveCallParameters,
  resolveToken,
  simulateWrite,
} from '../../internal/utils.js'

/**
 * Unpauses a TIP-20 token.
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
 * const hash = await Actions.token.unpause(client, {
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function unpause<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: unpause.Options,
): Promise<unpause.ReturnType> {
  return unpause.inner(write, client, options)
}

export namespace unpause {
  export type Args = {
    /** Token to unpause. */
    token: TokenParameter['token']
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
    options: unpause.Options,
  ): Promise<dispatchWrite.ReturnType<action>> {
    return dispatchWrite(action, client, {
      ...options,
      ...unpause.call(client, options),
    })
  }

  /**
   * Defines a call to the `unpause` function.
   *
   * Can be passed to any action that accepts a contract call. The token is
   * selected by `token`, which is either a TIP-20 token id or a contract
   * `address`.
   *
   * @param parameters - Client (optional), followed by the call arguments.
   * @returns The call.
   */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [client, args] = resolveCallParameters(parameters)
    const { token } = args
    return defineCall({
      abi: Abis.tip20,
      address: resolveToken(client, { token }).address,
      args: [],
      functionName: 'unpause',
    })
  }

  /**
   * Estimates the gas required.
   *
   * @param client - Client.
   * @param options - Options.
   * @returns The gas estimate.
   */
  export async function estimateGas<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: unpause.Options,
  ): Promise<bigint> {
    return estimateWrite(client, {
      ...pickWriteParameters(options),
      ...unpause.call(client, options),
    })
  }

  /**
   * Simulates the call.
   *
   * @param client - Client.
   * @param options - Options.
   * @returns The simulation result and write request.
   */
  export async function simulate<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: unpause.Options,
  ): Promise<simulateContract.ReturnType<typeof Abis.tip20, 'unpause'>> {
    return simulateWrite(client, {
      ...pickWriteParameters(options),
      ...unpause.call(client, options),
    })
  }

  /**
   * Extracts the `PauseStateUpdate` event from logs.
   *
   * @param logs - The logs.
   * @returns The `PauseStateUpdate` event.
   */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.tip20, logs, {
      eventName: 'PauseStateUpdate',
      strict: true,
    })
    if (!log) throw new Error('`PauseStateUpdate` event not found.')
    return log
  }
}
