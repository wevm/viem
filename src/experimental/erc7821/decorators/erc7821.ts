import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import {
  type ExecuteParameters,
  type ExecuteReturnType,
  execute,
} from '../actions/execute.js'
import {
  type SupportsExecutionModeParameters,
  type SupportsExecutionModeReturnType,
  supportsExecutionMode,
} from '../actions/supportsExecutionMode.js'

export type Erc7821Actions<
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
> = {
  /**
   * Executes call(s) using the `execute` function on an [ERC-7821-compatible contract](https://eips.ethereum.org/EIPS/eip-7821).
   *
   * @example
   * ```ts
   * import { createClient, http } from 'viem'
   * import { privateKeyToAccount } from 'viem/accounts'
   * import { mainnet } from 'viem/chains'
   * import { erc7821Actions } from 'viem/experimental'
   *
   * const account = privateKeyToAccount('0x...')
   *
   * const client = createClient({
   *   chain: mainnet,
   *   transport: http(),
   * }).extend(erc7821Actions())
   *
   * const hash = await client.execute({
   *   account,
   *   calls: [{
   *     {
   *       data: '0xdeadbeef',
   *       to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
   *     },
   *     {
   *       to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
   *       value: 69420n,
   *     },
   *   }],
   *   to: account.address,
   * })
   * ```
   *
   * @example
   * ```ts
   * // Account Hoisting
   * import { createClient, http } from 'viem'
   * import { privateKeyToAccount } from 'viem/accounts'
   * import { mainnet } from 'viem/chains'
   * import { erc7821Actions } from 'viem/experimental'
   *
   * const account = privateKeyToAccount('0x...')
   *
   * const client = createClient({
   *   account,
   *   chain: mainnet,
   *   transport: http(),
   * }).extend(erc7821Actions())
   *
   * const hash = await client.execute({
   *   calls: [{
   *     {
   *       data: '0xdeadbeef',
   *       to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
   *     },
   *     {
   *       to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
   *       value: 69420n,
   *     },
   *   }],
   *   to: account.address,
   * })
   * ```
   *
   * @param client - Client to use.
   * @param parameters - {@link ExecuteParameters}
   * @returns Transaction hash. {@link ExecuteReturnType}
   */
  execute: <
    const calls extends readonly unknown[],
    chainOverride extends Chain | undefined = undefined,
  >(
    parameters: ExecuteParameters<calls, chain, account, chainOverride>,
  ) => Promise<ExecuteReturnType>
  /**
   * Checks if the contract supports the ERC-7821 execution mode.
   *
   * @example
   * ```ts
   * import { createClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { erc7821Actions } from 'viem/experimental'
   *
   * const client = createClient({
   *   chain: mainnet,
   *   transport: http(),
   * }).extend(erc7821Actions())
   *
   * const supported = await supportsExecutionMode(client, {
   *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
   * })
   * ```
   *
   * @param client - Client to use.
   * @param parameters - {@link SupportsExecutionModeParameters}
   * @returns If the execution mode is supported. {@link SupportsExecutionModeReturnType}
   */
  supportsExecutionMode: (
    parameters: SupportsExecutionModeParameters,
  ) => Promise<SupportsExecutionModeReturnType>
}

/**
 * A suite of Actions for [ERC-7821](https://eips.ethereum.org/EIPS/eip-7821).
 *
 * @example
 * import { createClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { erc7821Actions } from 'viem/experimental'
 *
 * const client = createClient({
 *   chain: mainnet,
 *   transport: http(),
 * }).extend(erc7821Actions())
 */
export function erc7821Actions() {
  return <
    transport extends Transport,
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  >(
    client: Client<transport, chain, account>,
  ): Erc7821Actions<chain, account> => {
    return {
      execute: (parameters) => execute(client, parameters),
      supportsExecutionMode: (parameters) =>
        supportsExecutionMode(client, parameters),
    }
  }
}
