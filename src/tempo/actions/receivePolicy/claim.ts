import { AbiEvent } from 'ox'
import type { Address, Errors, Hex, Log } from 'ox'

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

/** Claims blocked funds for a receipt. */
export async function claim<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: claim.Options,
): Promise<claim.ReturnType> {
  return claim.inner(write, client, options)
}

export namespace claim {
  export type Args = {
    /** Destination to release the blocked funds to. */
    to: Address.Address
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
      ...claim.call(client, options),
    })
  }

  /** Defines a call to the `claim` function. */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [, args] = resolveCallParameters(parameters)
    const { receipt, to } = args
    return defineCall({
      abi: Abis.receivePolicyGuard,
      address: Addresses.receivePolicyGuard,
      args: [to, receipt],
      functionName: 'claim',
    })
  }

  /** Estimates the gas required to claims blocked funds for a receipt. */
  export async function estimateGas<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(client: Client.Client<chain, account>, options: Options): Promise<bigint> {
    return estimateWrite(client, {
      ...pickWriteParameters(options),
      ...claim.call(client, options),
    })
  }

  /** Simulates claims blocked funds for a receipt. */
  export async function simulate<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: Options,
  ): Promise<
    simulateContract.ReturnType<typeof Abis.receivePolicyGuard, 'claim'>
  > {
    return simulateWrite(client, {
      ...pickWriteParameters(options),
      ...claim.call(client, options),
    })
  }

  /** Extracts the `ReceiptClaimed` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.receivePolicyGuard, logs, {
      eventName: 'ReceiptClaimed',
      strict: true,
    })
    if (!log) throw new Error('`ReceiptClaimed` event not found.')
    return log
  }
}
