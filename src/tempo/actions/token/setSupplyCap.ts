import { AbiEvent } from 'ox'
import type { Errors, Log } from 'ox'

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
 * Sets the supply cap for a TIP-20 token.
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
 * const hash = await Actions.token.setSupplyCap(client, {
 *   supplyCap: 1_000_000n,
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function setSupplyCap<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: setSupplyCap.Options,
): Promise<setSupplyCap.ReturnType> {
  return setSupplyCap.inner(write, client, options)
}

export namespace setSupplyCap {
  export type Args = {
    /** New supply cap. */
    supplyCap: bigint
  } & TokenParameter
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
    options: setSupplyCap.Options,
  ): Promise<dispatchWrite.ReturnType<action>> {
    return dispatchWrite(action, client, {
      ...options,
      ...setSupplyCap.call(client, options),
    })
  }

  /**
   * Defines a call to the `setSupplyCap` function.
   *
   * Can be passed to any action that accepts a contract call. The token is
   * selected by `token`, which is a TIP-20 token contract address.
   *
   * @param parameters - Client (optional), followed by the call arguments.
   * @returns The call.
   */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [client, args] = resolveCallParameters(parameters)
    const { supplyCap, token } = args
    return defineCall({
      abi: Abis.tip20,
      address: resolveToken(client, { token }).address,
      args: [supplyCap],
      functionName: 'setSupplyCap',
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
    options: setSupplyCap.Options,
  ): Promise<bigint> {
    return estimateWrite(client, {
      ...pickWriteParameters(options),
      ...setSupplyCap.call(client, options),
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
    options: setSupplyCap.Options,
  ): Promise<simulateContract.ReturnType<typeof Abis.tip20, 'setSupplyCap'>> {
    return simulateWrite(client, {
      ...pickWriteParameters(options),
      ...setSupplyCap.call(client, options),
    })
  }

  /**
   * Extracts the `SupplyCapUpdate` event from logs.
   *
   * @param logs - The logs.
   * @returns The `SupplyCapUpdate` event.
   */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.tip20, logs, {
      eventName: 'SupplyCapUpdate',
      strict: true,
    })
    if (!log) throw new Error('`SupplyCapUpdate` event not found.')
    return log
  }
}
