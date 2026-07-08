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

/**
 * Removes liquidity from a pool.
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
 * const hash = await Actions.amm.burn(client, {
 *   userToken: '0x20c0000000000000000000000000000000000001',
 *   validatorToken: '0x20c0000000000000000000000000000000000002',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
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
    /** Amount of LP tokens to burn. */
    liquidity: bigint
    /** Address to send tokens to. */
    to: Address.Address
    /** User token address. */
    userToken: Address.Address
    /** Validator token address. */
    validatorToken: Address.Address
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
    options: burn.Options,
  ): Promise<dispatchWrite.ReturnType<action>> {
    return dispatchWrite(action, client, {
      ...options,
      ...burn.call(client, options),
    })
  }

  /** Defines a call to the `burn` function. */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [, args] = resolveCallParameters(parameters)
    const { liquidity, to, userToken, validatorToken } = args
    const callArgs = [
      userToken,
      validatorToken,
      liquidity,
      to,
    ] as const
    return defineCall({
      abi: Abis.feeAmm,
      address: Addresses.feeManager,
      functionName: 'burn',
      args: callArgs,
    })
  }

  /** Estimates the gas required for the `burn` function. */
  export async function estimateGas<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: burn.Options,
  ): Promise<bigint> {
    return estimateWrite(client, {
      ...pickWriteParameters(options),
      ...burn.call(client, options),
    })
  }

  /** Simulates the `burn` function. */
  export async function simulate<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: burn.Options,
  ): Promise<simulateContract.ReturnType<typeof Abis.feeAmm, 'burn'>> {
    return simulateWrite(client, {
      ...pickWriteParameters(options),
      ...burn.call(client, options),
    })
  }

  /** Extracts the `Burn` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.feeAmm, logs, {
      eventName: 'Burn',
      strict: true,
    })
    if (!log) throw new Error('`Burn` event not found.')
    return log
  }
}
