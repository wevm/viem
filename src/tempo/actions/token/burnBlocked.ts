import { AbiEvent } from 'ox'
import type { Address, Errors, Log } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import type { simulate as simulateContract } from '../../../core/actions/contract/simulate.js'
import { write } from '../../../core/actions/contract/write.js'
import type { writeSync } from '../../../core/actions/contract/writeSync.js'
import {
  type AmountInput,
  toBaseUnits,
} from '../../../core/actions/token/internal.js'
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
 * Burns TIP-20 tokens from a blocked address.
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
 * const hash = await Actions.token.burnBlocked(client, {
 *   amount: 100n,
 *   from: '0x…',
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function burnBlocked<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: burnBlocked.Options,
): Promise<burnBlocked.ReturnType> {
  return burnBlocked.inner(write, client, options)
}

export namespace burnBlocked {
  export type Args = {
    /** Amount of tokens to burn, in base units or formatted decimal form. */
    amount: AmountInput
    /** Address to burn tokens from. */
    from: Address.Address
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
    options: burnBlocked.Options,
  ): Promise<dispatchWrite.ReturnType<action>> {
    return dispatchWrite(action, client, {
      ...options,
      ...burnBlocked.call(client, options),
    })
  }

  /**
   * Defines a call to the `burnBlocked` function.
   *
   * Can be passed to any action that accepts a contract call. The token is
   * selected by `token`; `amount.decimals` is inferred from the client's
   * declared `tokens` when omitted.
   *
   * @param parameters - Client (optional), followed by the call arguments.
   * @returns The call.
   */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [client, args] = resolveCallParameters(parameters)
    const { amount, from, token } = args
    const { address, decimals } = resolveToken(client, { token })
    return defineCall({
      abi: Abis.tip20,
      address,
      args: [from, toBaseUnits(amount, decimals)],
      functionName: 'burnBlocked',
    })
  }

  /**
   * Estimates the gas required to burn tokens from a blocked address.
   * `amount.decimals` is inferred from the client's declared `tokens` when
   * omitted.
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
    options: burnBlocked.Options,
  ): Promise<bigint> {
    return estimateWrite(client, {
      ...pickWriteParameters(options),
      ...burnBlocked.call(client, options),
    })
  }

  /**
   * Simulates burning tokens from a blocked address. `amount.decimals` is
   * inferred from the client's declared `tokens` when omitted.
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
    options: burnBlocked.Options,
  ): Promise<simulateContract.ReturnType<typeof Abis.tip20, 'burnBlocked'>> {
    return simulateWrite(client, {
      ...pickWriteParameters(options),
      ...burnBlocked.call(client, options),
    })
  }

  /**
   * Extracts the `BurnBlocked` event from logs.
   *
   * @param logs - The logs.
   * @returns The `BurnBlocked` event.
   */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.tip20, logs, {
      eventName: 'BurnBlocked',
      strict: true,
    })
    if (!log) throw new Error('`BurnBlocked` event not found.')
    return log
  }
}
