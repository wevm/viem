import type { Address } from 'abitype'
import type { Account } from '../../accounts/types.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { erc20Abi } from '../../constants/abis.js'
import type { BaseErrorType } from '../../errors/base.js'
import type { Chain } from '../../types/chain.js'
import type { Log } from '../../types/log.js'
import { parseEventLogs } from '../../utils/abi/parseEventLogs.js'
import { parseUnits } from '../../utils/unit/parseUnits.js'
import { estimateContractGas } from '../public/estimateContractGas.js'
import {
  type SimulateContractReturnType,
  simulateContract,
} from '../public/simulateContract.js'
import type { WriteContractReturnType } from '../wallet/writeContract.js'
import { writeContract } from '../wallet/writeContract.js'
import type { writeContractSync } from '../wallet/writeContractSync.js'
import {
  defineCall,
  pickWriteParameters,
  resolveToken,
  type TokenParameters,
  type WriteParameters,
} from './internal.js'

/**
 * Transfers ERC-20 tokens to another address.
 *
 * Pass `from` to transfer on behalf of another address using an allowance
 * (calls `transferFrom`); otherwise transfers from the caller (calls
 * `transfer`).
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { erc20 } from 'viem/actions'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const hash = await erc20.transfer(client, {
 *   amount: '100',
 *   to: '0x...',
 *   token: '0x...',
 * })
 * ```
 *
 * @example
 * ```ts
 * // Transfer on behalf of another address (via an allowance).
 * const hash = await erc20.transfer(client, {
 *   amount: '100',
 *   from: '0x...',
 *   to: '0x...',
 *   token: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function transfer<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: transfer.Parameters<chain, account>,
): Promise<transfer.ReturnValue> {
  return transfer.inner(writeContract, client, parameters)
}

export namespace transfer {
  export type Args<chain extends Chain | undefined = Chain | undefined> = {
    /** Amount of tokens to transfer, as a human-readable decimal string (e.g. `'10.5'`). */
    amount: string
    /** Address to transfer tokens from (uses an allowance via `transferFrom`). */
    from?: Address | undefined
    /** Address to transfer tokens to. */
    to: Address
  } & TokenParameters<chain>
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args<chain>
  export type ReturnValue = WriteContractReturnType
  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType

  /** @internal */
  export async function inner<
    action extends typeof writeContract | typeof writeContractSync,
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    action: action,
    client: Client<Transport, chain, account>,
    parameters: transfer.Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    return (await action(client, {
      ...parameters,
      ...defineCall(getCall(client, parameters)),
    } as never)) as never
  }

  /**
   * Defines a call to the `transfer` (or `transferFrom`, when `from` is given)
   * function.
   *
   * Can be passed as a parameter to `estimateContractGas`, `simulateContract`,
   * `sendCalls`, `sendTransaction` (`calls`), or `multicall`. The token is
   * selected by `token`, which is either a token name (resolved from the
   * client's chain `tokens` config) or a contract `address`; `decimals` is
   * inferred from the chain when omitted.
   *
   * @param client - Client.
   * @param parameters - Parameters.
   * @returns The call.
   */
  export function call<chain extends Chain | undefined>(
    client: Client<Transport, chain>,
    parameters: Args<chain>,
  ) {
    return defineCall(getCall(client, parameters))
  }

  /**
   * Estimates the gas required to transfer ERC-20 tokens. `decimals` is
   * inferred from the client's chain `tokens` config when omitted.
   *
   * @param client - Client.
   * @param parameters - Parameters.
   * @returns The gas estimate.
   */
  export async function estimateGas<
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    client: Client<Transport, chain, account>,
    parameters: transfer.Parameters<chain, account>,
  ): Promise<bigint> {
    return estimateContractGas(client, {
      ...pickWriteParameters(parameters as never),
      ...getCall(client, parameters),
    } as never)
  }

  /**
   * Simulates a transfer of ERC-20 tokens. `decimals` is inferred from the
   * client's chain `tokens` config when omitted.
   *
   * @param client - Client.
   * @param parameters - Parameters.
   * @returns The simulation result and write request.
   */
  export async function simulate<
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    client: Client<Transport, chain, account>,
    parameters: transfer.Parameters<chain, account>,
  ): Promise<
    SimulateContractReturnType<typeof erc20Abi, 'transfer' | 'transferFrom'>
  > {
    return simulateContract(client, {
      ...pickWriteParameters(parameters as never),
      ...getCall(client, parameters),
    } as never) as never
  }

  /**
   * Extracts the `Transfer` event from logs.
   *
   * @param logs - The logs.
   * @returns The `Transfer` event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: erc20Abi,
      logs,
      eventName: 'Transfer',
      strict: true,
    })
    if (!log) throw new Error('`Transfer` event not found.')
    return log
  }
}

/** Builds the underlying `transfer`/`transferFrom` contract call. @internal */
function getCall(
  client: Client<Transport, Chain | undefined>,
  parameters: transfer.Args,
) {
  const { amount, from, to } = parameters
  const { address, decimals } = resolveToken(client, parameters)
  const value = parseUnits(amount, decimals)
  if (from)
    return {
      abi: erc20Abi,
      address,
      args: [from, to, value],
      functionName: 'transferFrom',
    } as const
  return {
    abi: erc20Abi,
    address,
    args: [to, value],
    functionName: 'transfer',
  } as const
}
