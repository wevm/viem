import { AbiEvent } from 'ox'
import type { Address, Errors, Log } from 'ox'

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

/** modifies a TIP-403 transfer policy blacklist. */
export async function modifyBlacklist<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: modifyBlacklist.Options,
): Promise<modifyBlacklist.ReturnType> {
  return modifyBlacklist.inner(write, client, options)
}

export namespace modifyBlacklist {
  export type Args = {
    /** Target account address. */
    address: Address.Address
    /** Policy ID. */
    policyId: bigint
    /** Whether the account is restricted. */
    restricted: boolean
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
      ...modifyBlacklist.call(client, options),
    })
  }

  /** Defines a call to the `modifyPolicyBlacklist` function. */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [, args] = resolveCallParameters(parameters)
    return defineCall({
      abi: Abis.tip403Registry,
      address: Addresses.tip403Registry,
      args: [args.policyId, args.address, args.restricted],
      functionName: 'modifyPolicyBlacklist',
    })
  }

  /** Estimates the gas required to modifies a TIP-403 transfer policy blacklist. */
  export async function estimateGas<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(client: Client.Client<chain, account>, options: Options): Promise<bigint> {
    return estimateWrite(client, {
      ...pickWriteParameters(options),
      ...modifyBlacklist.call(client, options),
    })
  }

  /** Simulates modifies a TIP-403 transfer policy blacklist. */
  export async function simulate<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: Options,
  ): Promise<
    simulateContract.ReturnType<
      typeof Abis.tip403Registry,
      'modifyPolicyBlacklist'
    >
  > {
    return simulateWrite(client, {
      ...pickWriteParameters(options),
      ...modifyBlacklist.call(client, options),
    })
  }

  /** Extracts the `BlacklistUpdated` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.tip403Registry, logs, {
      eventName: 'BlacklistUpdated',
      strict: true,
    })
    if (!log) throw new Error('`BlacklistUpdated` event not found.')
    return log
  }
}
