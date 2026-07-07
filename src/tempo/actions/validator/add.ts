import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'
import type * as Hex from 'ox/Hex'

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
 * Adds a new validator.
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
 * const hash = await Actions.validator.add(client, {
 *   newValidatorAddress: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function add<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: add.Options,
): Promise<add.ReturnType> {
  return add.inner(write, client, options)
}

export namespace add {
  export type Args = {
    /** Address of the new validator. */
    newValidatorAddress: Address.Address
    /** Validator communication public key. */
    publicKey: Hex.Hex
    /** Whether the validator should be active. */
    active: boolean
    /** Validator inbound address `<hostname|ip>:<port>`. */
    inboundAddress: string
    /** Validator outbound IP address `<ip>:<port>`. */
    outboundAddress: string
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
      ...add.call(client, options),
    })
  }

  /**
   * Defines a call to the `addValidator` function.
   *
   * @param parameters - Client (optional), followed by the call arguments.
   * @returns The call.
   */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [, args] = resolveCallParameters(parameters)
    const {
      newValidatorAddress,
      publicKey,
      active,
      inboundAddress,
      outboundAddress,
    } = args
    return defineCall({
      abi: Abis.validatorConfig,
      address: Addresses.validator,
      args: [
        newValidatorAddress,
        publicKey,
        active,
        inboundAddress,
        outboundAddress,
      ],
      functionName: 'addValidator',
    })
  }

  /** Estimates the gas required to adds a new validator. */
  export async function estimateGas<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(client: Client.Client<chain, account>, options: Options): Promise<bigint> {
    return estimateWrite(client, {
      ...pickWriteParameters(options),
      ...add.call(client, options),
    })
  }

  /** Simulates adds a new validator. */
  export async function simulate<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: Options,
  ): Promise<
    simulateContract.ReturnType<typeof Abis.validatorConfig, 'addValidator'>
  > {
    return simulateWrite(client, {
      ...pickWriteParameters(options),
      ...add.call(client, options),
    })
  }
}
