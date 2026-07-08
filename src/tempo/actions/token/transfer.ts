import { AbiEvent, Hex } from 'ox'
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
 * Transfers TIP-20 tokens to another address.
 *
 * Pass `from` to transfer on behalf of another address using an allowance
 * (calls `transferFrom`); otherwise transfers from the caller (calls
 * `transfer`). Pass `memo` to use the memo-carrying transfer function.
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
 * const hash = await Actions.token.transfer(client, {
 *   amount: 100n,
 *   to: '0x…',
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function transfer<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: transfer.Options,
): Promise<transfer.ReturnType> {
  return transfer.inner(write, client, options)
}

export namespace transfer {
  export type Args = {
    /** Amount to transfer in base units, or as a formatted helper. */
    amount: AmountInput
    /** Address to transfer tokens from (uses an allowance via `transferFrom`). */
    from?: Address.Address | undefined
    /** Memo to include in the transfer. */
    memo?: Hex.Hex | undefined
    /** Address to transfer tokens to. */
    to: Address.Address
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
    options: transfer.Options,
  ): Promise<dispatchWrite.ReturnType<action>> {
    return dispatchWrite(action, client, {
      ...options,
      ...transfer.call(client, options),
    })
  }

  /**
   * Defines a call to the `transfer`, `transferFrom`, `transferWithMemo`, or
   * `transferFromWithMemo` function.
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
    const { from, memo, to, token } = args
    const { address, decimals } = resolveToken(client, { token })
    const value = toBaseUnits(args.amount, decimals)
    const call = (() => {
      if (memo && from)
        return {
          args: [from, to, value, Hex.padLeft(memo, 32)],
          functionName: 'transferFromWithMemo',
        } as const
      if (memo)
        return {
          args: [to, value, Hex.padLeft(memo, 32)],
          functionName: 'transferWithMemo',
        } as const
      if (from)
        return {
          args: [from, to, value],
          functionName: 'transferFrom',
        } as const
      return {
        args: [to, value],
        functionName: 'transfer',
      } as const
    })()
    return defineCall({
      abi: Abis.tip20,
      address,
      ...call,
    })
  }

  /**
   * Estimates the gas required to transfer TIP-20 tokens. `amount.decimals` is
   * inferred from the client's declared `tokens` when omitted.
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
    options: transfer.Options,
  ): Promise<bigint> {
    return estimateWrite(client, {
      ...pickWriteParameters(options),
      ...transfer.call(client, options),
    })
  }

  /**
   * Simulates a transfer of TIP-20 tokens. `amount.decimals` is inferred from
   * the client's declared `tokens` when omitted.
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
    options: transfer.Options,
  ): Promise<
    simulateContract.ReturnType<
      typeof Abis.tip20,
      'transfer' | 'transferFrom' | 'transferWithMemo' | 'transferFromWithMemo'
    >
  > {
    return simulateWrite(client, {
      ...pickWriteParameters(options),
      ...transfer.call(client, options),
    })
  }

  /**
   * Extracts the `Transfer` event from logs.
   *
   * @param logs - The logs.
   * @returns The `Transfer` event.
   */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.tip20, logs, {
      eventName: 'Transfer',
      strict: true,
    })
    if (!log) throw new Error('`Transfer` event not found.')
    return log
  }
}
