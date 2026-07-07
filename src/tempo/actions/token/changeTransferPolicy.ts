import * as AbiEvent from 'ox/AbiEvent'
import type * as Errors from 'ox/Errors'
import type * as Log from 'ox/Log'
import type * as TokenId from 'ox/tempo/TokenId'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { estimateGas as estimateContractGas } from '../../../core/actions/contract/estimateGas.js'
import { simulate as simulateContract } from '../../../core/actions/contract/simulate.js'
import { write } from '../../../core/actions/contract/write.js'
import type { writeSync } from '../../../core/actions/contract/writeSync.js'
import * as Abis from '../../Abis.js'
import type { WriteParameters } from '../../internal/types.js'
import {
  type CallParameters,
  defineCall,
  pickWriteParameters,
  resolveCallParameters,
  resolveToken,
} from '../../internal/utils.js'

/**
 * Changes the transfer policy ID for a TIP-20 token.
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
 * const hash = await Actions.token.changeTransferPolicy(client, {
 *   policyId: 1n,
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function changeTransferPolicy<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: changeTransferPolicy.Options,
): Promise<changeTransferPolicy.ReturnType> {
  return changeTransferPolicy.inner(write, client, options)
}

export namespace changeTransferPolicy {
  export type Args = {
    /** New transfer policy ID. */
    policyId: bigint
    /** Address or ID of the TIP-20 token. */
    token: TokenId.TokenIdOrAddress
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
    options: changeTransferPolicy.Options,
  ): Promise<ActionReturnType<action>> {
    return (await action(client, {
      ...options,
      ...changeTransferPolicy.call(client, options as never),
    } as never)) as never
  }

  /**
   * Defines a call to the `changeTransferPolicyId` function.
   *
   * Can be passed to any action that accepts a contract call. The token is
   * selected by `token`, which is either a TIP-20 token id or a contract
   * `address`.
   *
   * @param parameters - Client (optional), followed by the call arguments.
   * @returns The call.
   */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [client, args] = resolveCallParameters(parameters)
    const { policyId, token } = args
    return defineCall({
      abi: Abis.tip20,
      address: resolveToken(client, { token }).address,
      args: [policyId],
      functionName: 'changeTransferPolicyId',
    })
  }

  /**
   * Estimates the gas required to change a transfer policy.
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
    options: changeTransferPolicy.Options,
  ): Promise<bigint> {
    return estimateContractGas(client, {
      ...pickWriteParameters(options as never),
      ...changeTransferPolicy.call(client, options as never),
    } as never)
  }

  /**
   * Simulates changing a transfer policy.
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
    options: changeTransferPolicy.Options,
  ): Promise<
    simulateContract.ReturnType<typeof Abis.tip20, 'changeTransferPolicyId'>
  > {
    return simulateContract(client, {
      ...pickWriteParameters(options as never),
      ...changeTransferPolicy.call(client, options as never),
    } as never) as never
  }

  /**
   * Extracts the `TransferPolicyUpdate` event from logs.
   *
   * @param logs - The logs.
   * @returns The `TransferPolicyUpdate` event.
   */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.tip20, logs, {
      eventName: 'TransferPolicyUpdate',
      strict: true,
    })
    if (!log) throw new Error('`TransferPolicyUpdate` event not found.')
    return log
  }
}

type ActionReturnType<action> = action extends typeof writeSync
  ? writeSync.ReturnType
  : write.ReturnType
