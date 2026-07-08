import { AbiEvent } from 'ox'
import type { Address, Errors, Log } from 'ox'

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
 * Prepares a quote token update for a TIP-20 token.
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
 * const hash = await Actions.token.prepareUpdateQuoteToken(client, {
 *   quoteToken: '0x20c0000000000000000000000000000000000002',
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function prepareUpdateQuoteToken<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: prepareUpdateQuoteToken.Options,
): Promise<prepareUpdateQuoteToken.ReturnType> {
  return prepareUpdateQuoteToken.inner(write, client, options)
}

export namespace prepareUpdateQuoteToken {
  export type Args = {
    /** New quote token. */
    quoteToken: Address.Address
  } & TokenParameter
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
    options: prepareUpdateQuoteToken.Options,
  ): Promise<dispatchWrite.ReturnType<action>> {
    return dispatchWrite(action, client, {
      ...options,
      ...prepareUpdateQuoteToken.call(client, options),
    })
  }

  /**
   * Defines a call to the `setNextQuoteToken` function.
   *
   * @param parameters - Client (optional), followed by the call arguments.
   * @returns The call.
   */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [client, args] = resolveCallParameters(parameters)
    const { quoteToken, token } = args
    return defineCall({
      abi: Abis.tip20,
      address: resolveToken(client, { token }).address,
      args: [resolveToken(client, { token: quoteToken }).address],
      functionName: 'setNextQuoteToken',
    })
  }

  /**
   * Estimates the gas required to prepare a quote token update.
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
    options: prepareUpdateQuoteToken.Options,
  ): Promise<bigint> {
    return estimateWrite(client, {
      ...pickWriteParameters(options),
      ...prepareUpdateQuoteToken.call(client, options),
    })
  }

  /**
   * Simulates preparing a quote token update.
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
    options: prepareUpdateQuoteToken.Options,
  ): Promise<
    simulateContract.ReturnType<typeof Abis.tip20, 'setNextQuoteToken'>
  > {
    return simulateWrite(client, {
      ...pickWriteParameters(options),
      ...prepareUpdateQuoteToken.call(client, options),
    })
  }

  /**
   * Extracts the `NextQuoteTokenSet` event from logs.
   *
   * @param logs - The logs.
   * @returns The `NextQuoteTokenSet` event.
   */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.tip20, logs, {
      eventName: 'NextQuoteTokenSet',
      strict: true,
    })
    if (!log) throw new Error('`NextQuoteTokenSet` event not found.')
    return log
  }
}

export type PrepareUpdateQuoteTokenEvent = {
  /** Account that prepared the quote token update. */
  updater: Address.Address
  /** Quote token to use after the update is completed. */
  nextQuoteToken: Address.Address
}
