import * as AbiEvent from 'ox/AbiEvent'
import type * as Address from 'ox/Address'
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
import * as Addresses from '../../Addresses.js'
import type { WriteParameters } from '../../internal/types.js'
import {
  type CallParameters,
  defineCall,
  pickWriteParameters,
  resolveCallParameters,
  resolveToken,
} from '../../internal/utils.js'

/**
 * Performs a rebalance swap from validator token to user token.
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
 * const hash = await Actions.amm.rebalanceSwap(client, {
 *   userToken: '0x20c0000000000000000000000000000000000001',
 *   validatorToken: '0x20c0000000000000000000000000000000000002',
 * } as never)
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function rebalanceSwap<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: rebalanceSwap.Options,
): Promise<rebalanceSwap.ReturnType> {
  return rebalanceSwap.inner(write, client, options)
}

export namespace rebalanceSwap {
  export type Args = {
    /** Amount of user token to receive. */
    amountOut: bigint
    /** Address to send the user token to. */
    to: Address.Address
    /** Address or ID of the user token. */
    userToken: TokenId.TokenIdOrAddress
    /** Address or ID of the validator token. */
    validatorToken: TokenId.TokenIdOrAddress
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
    options: rebalanceSwap.Options,
  ): Promise<ActionReturnType<action>> {
    return (await action(client, {
      ...options,
      ...rebalanceSwap.call(client, options as never),
    } as never)) as never
  }

  /** Defines a call to the `rebalanceSwap` function. */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [client, args] = resolveCallParameters(parameters)
    const { amountOut, to, userToken, validatorToken } = args
    const callArgs = [
      resolveToken(client, { token: userToken }).address,
      resolveToken(client, { token: validatorToken }).address,
      amountOut,
      to,
    ] as const
    return defineCall({
      abi: Abis.feeAmm,
      address: Addresses.feeManager,
      functionName: 'rebalanceSwap',
      args: callArgs,
    })
  }

  /** Estimates the gas required for the `rebalanceSwap` function. */
  export async function estimateGas<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: rebalanceSwap.Options,
  ): Promise<bigint> {
    return estimateContractGas(client, {
      ...pickWriteParameters(options as never),
      ...rebalanceSwap.call(client, options as never),
    } as never)
  }

  /** Simulates the `rebalanceSwap` function. */
  export async function simulate<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: rebalanceSwap.Options,
  ): Promise<simulateContract.ReturnType<typeof Abis.feeAmm, 'rebalanceSwap'>> {
    return simulateContract(client, {
      ...pickWriteParameters(options as never),
      ...rebalanceSwap.call(client, options as never),
    } as never) as never
  }

  /** Extracts the `RebalanceSwap` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.feeAmm, logs, {
      eventName: 'RebalanceSwap',
      strict: true,
    })
    if (!log) throw new Error('`RebalanceSwap` event not found.')
    return log
  }
}

type ActionReturnType<action> = action extends typeof writeSync
  ? writeSync.ReturnType
  : write.ReturnType
