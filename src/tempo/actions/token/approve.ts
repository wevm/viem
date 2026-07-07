import * as AbiEvent from 'ox/AbiEvent'
import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'
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
 * Approves a spender to transfer TIP-20 tokens on behalf of the caller.
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
 * const hash = await Actions.token.approve(client, {
 *   amount: 100n,
 *   spender: '0x…',
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function approve<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: approve.Options,
): Promise<approve.ReturnType> {
  return approve.inner(write, client, options)
}

export namespace approve {
  export type Args = {
    /** Amount to approve, in base units or formatted decimal form. */
    amount: AmountInput
    /** Address of the spender. */
    spender: Address.Address
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
    options: approve.Options,
  ): Promise<ActionReturnType<action>> {
    return (await action(client, {
      ...options,
      ...approve.call(client, options as never),
    } as never)) as never
  }

  /**
   * Defines a call to the `approve` function.
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
    const { amount, spender, token } = args
    const { address, decimals } = resolveToken(client, { token })
    return defineCall({
      abi: Abis.tip20,
      address,
      args: [spender, toBaseUnits(amount, decimals)],
      functionName: 'approve',
    })
  }

  /**
   * Estimates the gas required to approve a spender. `amount.decimals` is
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
    options: approve.Options,
  ): Promise<bigint> {
    return estimateContractGas(client, {
      ...pickWriteParameters(options as never),
      ...approve.call(client, options as never),
    } as never)
  }

  /**
   * Simulates an approval of a spender. `amount.decimals` is inferred from
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
    options: approve.Options,
  ): Promise<simulateContract.ReturnType<typeof Abis.tip20, 'approve'>> {
    return simulateContract(client, {
      ...pickWriteParameters(options as never),
      ...approve.call(client, options as never),
    } as never) as never
  }

  /**
   * Extracts the `Approval` event from logs.
   *
   * @param logs - The logs.
   * @returns The `Approval` event.
   */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.tip20, logs, {
      eventName: 'Approval',
      strict: true,
    })
    if (!log) throw new Error('`Approval` event not found.')
    return log
  }
}

type ActionReturnType<action> = action extends typeof writeSync
  ? writeSync.ReturnType
  : write.ReturnType
