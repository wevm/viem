import type { Address } from 'abitype'
import type { Account } from '../../accounts/types.js'
import type { Client } from '../../clients/createClient.js'
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
 * Approves a spender to transfer ERC-20 tokens on behalf of the caller.
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
 * const hash = await token.approve(client, {
 *   amount: 100000000n,
 *   spender: '0x...',
 *   token: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function approve<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: approve.Parameters<chain, account>,
): Promise<approve.ReturnValue> {
  return approve.inner(writeContract, client, parameters)
}

export namespace approve {
  export type Args<chain extends Chain | undefined = Chain | undefined> = {
    /** Amount to approve in base units, or as a formatted helper. */
    amount: AmountInput
    /** Address of the spender. */
    spender: Address
  } & TokenParameter<chain>
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
    parameters: approve.Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    return (await action(client, {
      ...parameters,
      ...approve.call(client, parameters as never),
    } as never)) as never
  }

  /**
   * Defines a call to the `approve` function.
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
  export function call<chain extends Chain | undefined>(
    client: Client<Transport, chain>,
    parameters: Args<chain>,
  ) {
    return defineCall(getCall(client, parameters))
  }

  /**
   * Estimates the gas required to approve a spender. `amount.decimals` is
   * inferred from declared chain tokens when omitted.
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
    parameters: approve.Parameters<chain, account>,
  ): Promise<bigint> {
    return estimateContractGas(client, {
      ...pickWriteParameters(parameters as never),
      ...approve.call(client, parameters as never),
    } as never)
  }

  /**
   * Simulates an approval of a spender. `amount.decimals` is inferred from
   * declared chain tokens when omitted.
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
    parameters: approve.Parameters<chain, account>,
  ): Promise<SimulateContractReturnType<typeof erc20Abi, 'approve'>> {
    return simulateContract(client, {
      ...pickWriteParameters(parameters as never),
      ...approve.call(client, parameters as never),
    } as never) as never
  }

  /**
   * Extracts the `Approval` event from logs.
   *
   * @param logs - The logs.
   * @returns The `Approval` event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: erc20Abi,
      logs,
      eventName: 'Approval',
      strict: true,
    })
    if (!log) throw new Error('`Approval` event not found.')
    return log
  }
}

/** Builds the underlying `approve` contract call. @internal */
function getCall<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: approve.Args<chain>,
) {
  const { amount, spender, token } = parameters
  const { address, decimals } = resolveToken(client, { token })
  return {
    abi: erc20Abi,
    address,
    args: [spender, toBaseUnits(amount, decimals)],
    functionName: 'approve',
  } as const
}
