import { AbiEvent } from 'ox'
import type { Address, Errors, Log } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import type { simulate as simulateContract } from '../../../core/actions/contract/simulate.js'
import { write } from '../../../core/actions/contract/write.js'
import type { writeSync } from '../../../core/actions/contract/writeSync.js'
import * as Abis from '../../Abis.js'
import type { AccessKeyAccount } from '../../Account.js'
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
import { resolveAccessKeyAddress } from './internal.js'

/**
 * Updates the spending limit for a specific token on an authorized access key.
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
 * const hash = await Actions.accessKey.updateLimit(client, {
 *   accessKey: '0x…',
 *   token: '0x…',
 *   limit: 1000000000000000000n,
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function updateLimit<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: updateLimit.Options,
): Promise<updateLimit.ReturnType> {
  return updateLimit.inner(write, client, options)
}

export namespace updateLimit {
  export type Args = {
    /** Access key to update. */
    accessKey: Address.Address | AccessKeyAccount
    /** New spending limit. */
    limit: bigint
    /** Token address. */
    token: Address.Address
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
      ...updateLimit.call(client, options),
    })
  }

  /** Defines a call to the `updateSpendingLimit` function. */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [, args] = resolveCallParameters(parameters)
    return defineCall({
      abi: Abis.accountKeychain,
      address: Addresses.accountKeychain,
      args: [resolveAccessKeyAddress(args.accessKey), args.token, args.limit],
      functionName: 'updateSpendingLimit',
    })
  }

  /** Estimates the gas required to update an access key's spending limit. */
  export async function estimateGas<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(client: Client.Client<chain, account>, options: Options): Promise<bigint> {
    return estimateWrite(client, {
      ...pickWriteParameters(options),
      ...updateLimit.call(client, options),
    })
  }

  /** Simulates updating an access key's spending limit. */
  export async function simulate<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: Options,
  ): Promise<
    simulateContract.ReturnType<
      typeof Abis.accountKeychain,
      'updateSpendingLimit'
    >
  > {
    return simulateWrite(client, {
      ...pickWriteParameters(options),
      ...updateLimit.call(client, options),
    })
  }

  /** Extracts the `SpendingLimitUpdated` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.accountKeychain, logs, {
      eventName: 'SpendingLimitUpdated',
      strict: true,
    })
    if (!log) throw new Error('`SpendingLimitUpdated` event not found.')
    return log
  }
}
