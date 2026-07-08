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

/** Burns the funds backing a blocked receipt. */
export async function burn<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: burn.Options,
): Promise<burn.ReturnType> {
  return burn.inner(write, client, options)
}

export namespace burn {
  export type Args = {
    /** The encoded claim receipt. */
    receipt: Hex.Hex
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
      ...burn.call(client, options),
    })
  }

  /** Defines a call to the `burnBlockedReceipt` function. */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [, args] = resolveCallParameters(parameters)
    const { receipt } = args
    return defineCall({
      abi: Abis.receivePolicyGuard,
      address: Addresses.receivePolicyGuard,
      args: [receipt],
      functionName: 'burnBlockedReceipt',
    })
  }

  /** Estimates the gas required to burns the funds backing a blocked receipt. */
  export async function estimateGas<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(client: Client.Client<chain, account>, options: Options): Promise<bigint> {
    return estimateWrite(client, {
      ...pickWriteParameters(options),
      ...burn.call(client, options),
    })
  }

  /** Simulates burns the funds backing a blocked receipt. */
  export async function simulate<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: Options,
  ): Promise<
    simulateContract.ReturnType<
      typeof Abis.receivePolicyGuard,
      'burnBlockedReceipt'
    >
  > {
    return simulateWrite(client, {
      ...pickWriteParameters(options),
      ...burn.call(client, options),
    })
  }

  /** Extracts the `ReceiptBurned` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.receivePolicyGuard, logs, {
      eventName: 'ReceiptBurned',
      strict: true,
    })
    if (!log) throw new Error('`ReceiptBurned` event not found.')
    return log
  }
}
