import { AbiEvent } from 'ox'
import type { Address, Errors, Log } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { write } from '../../../core/actions/contract/write.js'
import type { writeSync } from '../../../core/actions/contract/writeSync.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'
import type { WriteParameters } from '../../internal/types.js'
import {
  type CallParameters,
  defineCall,
  dispatchWrite,
  resolveCallParameters,
} from '../../internal/utils.js'

/**
 * Sets the calling validator's preferred fee token.
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
 * const hash = await Actions.fee.setValidatorToken(client, {
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function setValidatorToken<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: setValidatorToken.Options,
): Promise<setValidatorToken.ReturnType> {
  return setValidatorToken.inner(write, client, options)
}

export namespace setValidatorToken {
  export type Args = {
    /** Token address to set as the preferred fee token. */
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
    options: setValidatorToken.Options,
  ): Promise<dispatchWrite.ReturnType<action>> {
    return dispatchWrite(action, client, {
      ...options,
      ...setValidatorToken.call(client, options),
    })
  }

  /**
   * Defines a call to the `setValidatorToken` function.
   *
   * Can be passed to any action that accepts a contract call. The token is
   * selected by its contract `address`.
   *
   * @param parameters - Client (optional), followed by the call arguments.
   * @returns The call.
   */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [, args] = resolveCallParameters(parameters)
    return defineCall({
      abi: Abis.feeManager,
      address: Addresses.feeManager,
      args: [args.token],
      functionName: 'setValidatorToken',
    })
  }

  /**
   * Extracts the `ValidatorTokenSet` event from logs.
   *
   * @param logs - The logs.
   * @returns The `ValidatorTokenSet` event.
   */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.feeManager, logs, {
      eventName: 'ValidatorTokenSet',
      strict: true,
    })
    if (!log) throw new Error('`ValidatorTokenSet` event not found.')
    return log
  }
}
