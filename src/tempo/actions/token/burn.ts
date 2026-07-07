import * as AbiEvent from 'ox/AbiEvent'
import type * as Errors from 'ox/Errors'
import type * as Hex from 'ox/Hex'
import * as Hex_ from 'ox/Hex'
import type * as Log from 'ox/Log'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { estimateGas as estimateContractGas } from '../../../core/actions/contract/estimateGas.js'
import { simulate as simulateContract } from '../../../core/actions/contract/simulate.js'
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
  pickWriteParameters,
  resolveCallParameters,
  resolveToken,
} from '../../internal/utils.js'

/**
 * Burns TIP-20 tokens from the caller's balance.
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
 * const hash = await Actions.token.burn(client, {
 *   amount: 100n,
 *   token: '0x20c0000000000000000000000000000000000001',
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
    /** Amount of tokens to burn, in base units or formatted decimal form. */
    amount: AmountInput
    /** Memo to include in the burn. */
    memo?: Hex.Hex | undefined
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
    options: burn.Options,
  ): Promise<ActionReturnType<action>> {
    return (await action(client, {
      ...options,
      ...burn.call(client, options as never),
    } as never)) as never
  }

  /**
   * Defines a call to the `burn` or `burnWithMemo` function.
   *
   * Can be passed to any action that accepts a contract call. The token is
   * selected by `token`, which is either a TIP-20 token id or a contract
   * `address`; `amount.decimals` is inferred from the client's declared
   * `tokens` when omitted.
   *
   * @param parameters - Client (optional), followed by the call arguments.
   * @returns The call.
   */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [client, args] = resolveCallParameters(parameters)
    const { amount, memo, token } = args
    const { address, decimals } = resolveToken(client, { token })
    const value = toBaseUnits(amount, decimals)
    const callArgs = memo
      ? ({
          args: [value, Hex_.padLeft(memo, 32)],
          functionName: 'burnWithMemo',
        } as const)
      : ({
          args: [value],
          functionName: 'burn',
        } as const)
    return defineCall({
      abi: Abis.tip20,
      address,
      ...callArgs,
    })
  }

  /**
   * Estimates the gas required to burn tokens. `amount.decimals` is inferred
   * from the client's declared `tokens` when omitted.
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
    options: burn.Options,
  ): Promise<bigint> {
    return estimateContractGas(client, {
      ...pickWriteParameters(options as never),
      ...burn.call(client, options as never),
    } as never)
  }

  /**
   * Simulates burning tokens. `amount.decimals` is inferred from the client's
   * declared `tokens` when omitted.
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
    options: burn.Options,
  ): Promise<simulateContract.ReturnType<typeof Abis.tip20, 'burn'>> {
    return simulateContract(client, {
      ...pickWriteParameters(options as never),
      ...burn.call(client, options as never),
    } as never) as never
  }

  /**
   * Extracts the `Burn` event from logs.
   *
   * @param logs - The logs.
   * @returns The `Burn` event.
   */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.tip20, logs, {
      eventName: 'Burn',
      strict: true,
    })
    if (!log) throw new Error('`Burn` event not found.')
    return log
  }
}

type ActionReturnType<action> = action extends typeof writeSync
  ? writeSync.ReturnType
  : write.ReturnType
