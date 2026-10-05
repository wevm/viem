import type { Errors } from 'ox'
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
 * Sets the next epoch for a full DKG ceremony.
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
 * const hash = await Actions.validator.setNextFullDkgCeremony(client, {
 *   epoch: 1n,
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function setNextFullDkgCeremony<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: setNextFullDkgCeremony.Options,
): Promise<setNextFullDkgCeremony.ReturnType> {
  return setNextFullDkgCeremony.inner(write, client, options)
}

export namespace setNextFullDkgCeremony {
  export type Args = {
    /** Epoch number for the next full DKG ceremony. */
    epoch: bigint
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
      ...setNextFullDkgCeremony.call(client, options),
    })
  }

  /**
   * Defines a call to the `setNextFullDkgCeremony` function.
   *
   * @param parameters - Client (optional), followed by the call arguments.
   * @returns The call.
   */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [, args] = resolveCallParameters(parameters)
    const { epoch } = args
    return defineCall({
      abi: Abis.validatorConfig,
      address: Addresses.validator,
      args: [epoch],
      functionName: 'setNextFullDkgCeremony',
    })
  }

  /** Estimates the gas required to sets the next epoch for a full DKG ceremony. */
  export async function estimateGas<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(client: Client.Client<chain, account>, options: Options): Promise<bigint> {
    return estimateWrite(client, {
      ...pickWriteParameters(options),
      ...setNextFullDkgCeremony.call(client, options),
    })
  }

  /** Simulates sets the next epoch for a full DKG ceremony. */
  export async function simulate<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: Options,
  ): Promise<
    simulateContract.ReturnType<
      typeof Abis.validatorConfig,
      'setNextFullDkgCeremony'
    >
  > {
    return simulateWrite(client, {
      ...pickWriteParameters(options),
      ...setNextFullDkgCeremony.call(client, options),
    })
  }
}
