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
 * Burns a key-authorization witness, invalidating any authorization bound to
 * it before it is submitted onchain.
 *
 * Once burned, an `authorizeKey` call carrying the same `witness` will revert.
 * This lets applications issue a signed authorization offchain (see
 * {@link authorize}) while retaining the ability to revoke it.
 *
 * [TIP-1053](https://tips.sh/1053)
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
 * const hash = await Actions.accessKey.burnWitness(client, {
 *   witness: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function burnWitness<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: burnWitness.Options,
): Promise<burnWitness.ReturnType> {
  return burnWitness.inner(write, client, options)
}

export namespace burnWitness {
  export type Args = {
    /** The 32-byte witness to burn. */
    witness: Hex.Hex
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
      ...burnWitness.call(client, options),
    })
  }

  /** Defines a call to the `burnKeyAuthorizationWitness` function. */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [, args] = resolveCallParameters(parameters)
    return defineCall({
      abi: Abis.accountKeychain,
      address: Addresses.accountKeychain,
      args: [args.witness],
      functionName: 'burnKeyAuthorizationWitness',
    })
  }

  /** Estimates the gas required to burn a key-authorization witness. */
  export async function estimateGas<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(client: Client.Client<chain, account>, options: Options): Promise<bigint> {
    return estimateWrite(client, {
      ...pickWriteParameters(options),
      ...burnWitness.call(client, options),
    })
  }

  /** Simulates burning a key-authorization witness. */
  export async function simulate<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: Options,
  ): Promise<
    simulateContract.ReturnType<
      typeof Abis.accountKeychain,
      'burnKeyAuthorizationWitness'
    >
  > {
    return simulateWrite(client, {
      ...pickWriteParameters(options),
      ...burnWitness.call(client, options),
    })
  }

  /** Extracts the `KeyAuthorizationWitnessBurned` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.accountKeychain, logs, {
      eventName: 'KeyAuthorizationWitnessBurned',
      strict: true,
    })
    if (!log)
      throw new Error('`KeyAuthorizationWitnessBurned` event not found.')
    return log
  }
}
