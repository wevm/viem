import { AbiEvent } from 'ox'
import type { Errors, Hex, Log } from 'ox'

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
 * Registers a virtual master address.
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
 * const hash = await Actions.virtualAddress.registerMaster(client, {
 *   salt: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function registerMaster<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: registerMaster.Options,
): Promise<registerMaster.ReturnType> {
  return registerMaster.inner(write, client, options)
}

export namespace registerMaster {
  export type Args = {
    /** Salt (bytes32) used for proof-of-work master ID derivation. */
    salt: Hex.Hex
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
    options: Options,
  ): Promise<dispatchWrite.ReturnType<action>> {
    return dispatchWrite(action, client, {
      ...options,
      ...registerMaster.call(client, options),
    })
  }

  /** Defines a call to the `registerVirtualMaster` function. */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [, args] = resolveCallParameters(parameters)
    const { salt } = args
    return defineCall({
      abi: Abis.addressRegistry,
      address: Addresses.addressRegistry,
      args: [salt],
      functionName: 'registerVirtualMaster',
    })
  }

  /** Estimates the gas required to register a virtual master address. */
  export async function estimateGas<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(client: Client.Client<chain, account>, options: Options): Promise<bigint> {
    return estimateWrite(client, {
      ...pickWriteParameters(options),
      ...registerMaster.call(client, options),
    })
  }

  /** Simulates registering a virtual master address. */
  export async function simulate<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: Options,
  ): Promise<
    simulateContract.ReturnType<
      typeof Abis.addressRegistry,
      'registerVirtualMaster'
    >
  > {
    return simulateWrite(client, {
      ...pickWriteParameters(options),
      ...registerMaster.call(client, options),
    })
  }

  /** Extracts the `MasterRegistered` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.addressRegistry, logs, {
      eventName: 'MasterRegistered',
      strict: true,
    })
    if (!log) throw new Error('`MasterRegistered` event not found.')
    return log
  }
}
