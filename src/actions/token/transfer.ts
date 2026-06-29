import type { Address } from 'abitype'
import type { Account } from '../../accounts/types.js'
import type { Client, ClientTokens } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { erc20Abi } from '../../constants/abis.js'
import type { BaseErrorType } from '../../errors/base.js'
import type { Chain } from '../../types/chain.js'
import type { Log } from '../../types/log.js'
import { parseEventLogs } from '../../utils/abi/parseEventLogs.js'
import { estimateContractGas } from '../public/estimateContractGas.js'
import {
  type SimulateContractReturnType,
  simulateContract,
} from '../public/simulateContract.js'
import type { WriteContractReturnType } from '../wallet/writeContract.js'
import { writeContract } from '../wallet/writeContract.js'
import type { writeContractSync } from '../wallet/writeContractSync.js'
import {
  type AmountInput,
  defineCall,
  pickWriteParameters,
  resolveToken,
  type TokenParameter,
  toBaseUnits,
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
 * import { token } from 'viem/actions'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const hash = await token.transfer(client, {
 *   amount: 100000000n,
 *   to: '0x...',
 *   token: '0x...',
 * })
 * ```
 *
 * @example
 * ```ts
 * // Transfer on behalf of another address (via an allowance).
 * const hash = await token.transfer(client, {
 *   amount: 100000000n,
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
  tokens extends ClientTokens | undefined = undefined,
>(
  client: Client<Transport, chain, account, undefined, undefined, tokens>,
  parameters: transfer.Parameters<chain, account, tokens>,
): Promise<transfer.ReturnValue> {
  return transfer.inner(writeContract, client, parameters)
}

export namespace transfer {
  export type Args<
    chain extends Chain | undefined = Chain | undefined,
    tokens extends ClientTokens | undefined = ClientTokens | undefined,
  > = {
    /** Amount to transfer in base units, or as a formatted helper. */
    amount: AmountInput
    /** Address to transfer tokens from (uses an allowance via `transferFrom`). */
    from?: Address | undefined
    /** Address to transfer tokens to. */
    to: Address
  } & TokenParameter<chain, tokens>
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
    tokens extends ClientTokens | undefined = ClientTokens | undefined,
  > = WriteParameters<chain, account> & Args<chain, tokens>
  export type ReturnValue = WriteContractReturnType
  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType

  /** @internal */
  export async function inner<
    action extends typeof writeContract | typeof writeContractSync,
    chain extends Chain | undefined,
    account extends Account | undefined,
    tokens extends ClientTokens | undefined = undefined,
  >(
    action: action,
    client: Client<Transport, chain, account, undefined, undefined, tokens>,
    parameters: transfer.Parameters<chain, account, tokens>,
  ): Promise<ReturnType<action>> {
    return (await action(client, {
      ...parameters,
      ...transfer.call(client, parameters as never),
    } as never)) as never
  }

  /**
   * Defines a call to the `transfer` (or `transferFrom`, when `from` is given)
   * function.
   *
   * Can be passed as a parameter to `estimateContractGas`, `simulateContract`,
   * `sendCalls`, `sendTransaction` (`calls`), or `multicall`. The token is
   * selected by `token`, which is either a token name (resolved from the
   * client's chain `tokens` config) or a contract `address`; `amount.decimals`
   * is inferred from declared chain tokens when omitted.
   *
   * @param client - Client.
   * @param parameters - Parameters.
   * @returns The call.
   */
  export function call<
    chain extends Chain | undefined,
    account extends Account | undefined,
    tokens extends ClientTokens | undefined = undefined,
  >(
    client: Client<Transport, chain, account, undefined, undefined, tokens>,
    parameters: Args<chain, tokens>,
  ) {
    return defineCall(getCall(client, parameters as transfer.Args))
  }

  /**
   * Estimates the gas required to transfer ERC-20 tokens. `amount.decimals` is
   * inferred from declared chain tokens when omitted.
   *
   * @param client - Client.
   * @param parameters - Parameters.
   * @returns The gas estimate.
   */
  export async function estimateGas<
    chain extends Chain | undefined,
    account extends Account | undefined,
    tokens extends ClientTokens | undefined = undefined,
  >(
    client: Client<Transport, chain, account, undefined, undefined, tokens>,
    parameters: transfer.Parameters<chain, account, tokens>,
  ): Promise<bigint> {
    return estimateContractGas(client, {
      ...pickWriteParameters(parameters as never),
      ...transfer.call(client, parameters as never),
    } as never)
  }

  /**
   * Simulates a transfer of ERC-20 tokens. `amount.decimals` is inferred from
   * declared chain tokens when omitted.
   *
   * @param client - Client.
   * @param parameters - Parameters.
   * @returns The simulation result and write request.
   */
  export async function simulate<
    chain extends Chain | undefined,
    account extends Account | undefined,
    tokens extends ClientTokens | undefined = undefined,
  >(
    client: Client<Transport, chain, account, undefined, undefined, tokens>,
    parameters: transfer.Parameters<chain, account, tokens>,
  ): Promise<
    SimulateContractReturnType<typeof erc20Abi, 'transfer' | 'transferFrom'>
  > {
    return simulateContract(client, {
      ...pickWriteParameters(parameters as never),
      ...transfer.call(client, parameters as never),
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
  const { amount, from, to, token } = parameters
  const { address, decimals } = resolveToken(client, { token })
  const value = toBaseUnits(amount, decimals)
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
