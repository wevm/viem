import * as AbiEvent from 'ox/AbiEvent'
import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'
import type * as Log from 'ox/Log'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import type { simulate as simulateContract } from '../../../core/actions/contract/simulate.js'
import { write } from '../../../core/actions/contract/write.js'
import type { writeSync } from '../../../core/actions/contract/writeSync.js'
import * as Abis from '../../Abis.js'
import type { TokenParameter, WriteParameters } from '../../internal/types.js'
import {
  type CallParameters,
  defineCall,
  dispatchWrite,
  estimateWrite,
  pickWriteParameters,
  resolveCallParameters,
  resolveToken,
  simulateWrite,
} from '../../internal/utils.js'

/**
 * Completes a prepared quote token update for a TIP-20 token.
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
 * const hash = await Actions.token.updateQuoteToken(client, {
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function updateQuoteToken<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: updateQuoteToken.Options,
): Promise<updateQuoteToken.ReturnType> {
  return updateQuoteToken.inner(write, client, options)
}

export namespace updateQuoteToken {
  export type Args = TokenParameter
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
    options: updateQuoteToken.Options,
  ): Promise<dispatchWrite.ReturnType<action>> {
    return dispatchWrite(action, client, {
      ...options,
      ...updateQuoteToken.call(client, options),
    })
  }

  /**
   * Defines a call to the `completeQuoteTokenUpdate` function.
   *
   * @param parameters - Client (optional), followed by the call arguments.
   * @returns The call.
   */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [client, args] = resolveCallParameters(parameters)
    const { token } = args
    return defineCall({
      abi: Abis.tip20,
      address: resolveToken(client, { token }).address,
      args: [],
      functionName: 'completeQuoteTokenUpdate',
    })
  }

  /**
   * Estimates the gas required to complete a quote token update.
   *
   * @param client - Client.
   * @param options - Options.
   * @returns The gas estimate.
   */
  export async function estimateGas<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: updateQuoteToken.Options,
  ): Promise<bigint> {
    return estimateWrite(client, {
      ...pickWriteParameters(options),
      ...updateQuoteToken.call(client, options),
    })
  }

  /**
   * Simulates completing a quote token update.
   *
   * @param client - Client.
   * @param options - Options.
   * @returns The simulation result and write request.
   */
  export async function simulate<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: updateQuoteToken.Options,
  ): Promise<
    simulateContract.ReturnType<typeof Abis.tip20, 'completeQuoteTokenUpdate'>
  > {
    return simulateWrite(client, {
      ...pickWriteParameters(options),
      ...updateQuoteToken.call(client, options),
    })
  }

  /**
   * Extracts the `QuoteTokenUpdate` event from logs.
   *
   * @param logs - The logs.
   * @returns The `QuoteTokenUpdate` event.
   */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.tip20, logs, {
      eventName: 'QuoteTokenUpdate',
      strict: true,
    })
    if (!log) throw new Error('`QuoteTokenUpdate` event not found.')
    return log
  }
}

export type UpdateQuoteTokenEvent = {
  /** Account that completed the quote token update. */
  updater: Address.Address
  /** New quote token. */
  newQuoteToken: Address.Address
}
