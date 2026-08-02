import type * as Account from '../../Account.js'
import type * as Chain from '../../Chain.js'
import type * as Client from '../../Client.js'
import * as erc7821 from '../erc7821/index.js'

/**
 * Bag of [ERC-7821](https://eips.ethereum.org/EIPS/eip-7821) actions bound to
 * a {@link Client}. Pass to `Client.create`'s `.extend`.
 *
 * @example
 * ```ts
 * import { Account, Client, erc7821Actions, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const account = Account.fromPrivateKey('0x…')
 *
 * const client = Client.create({
 *   account,
 *   chain: mainnet,
 *   transport: http(),
 * }).extend(erc7821Actions())
 * const hash = await client.erc7821.execute({
 *   address: account.address,
 *   calls: [
 *     { data: '0xdeadbeef', to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8' },
 *     { to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', value: 69420n },
 *   ],
 * })
 * ```
 */
export function erc7821Actions() {
  return <
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
  ): erc7821Actions.Decorator<chain> => ({
    erc7821: {
      execute: (options) => erc7821.execute(client, options),
      executeBatches: (options) => erc7821.executeBatches(client, options),
      supportsExecutionMode: (options) =>
        erc7821.supportsExecutionMode(client, options),
    },
  })
}

export declare namespace erc7821Actions {
  type Decorator<
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
  > = {
    erc7821: {
      /**
       * Executes call(s) using the `execute` function on an
       * [ERC-7821-compatible contract](https://eips.ethereum.org/EIPS/eip-7821).
       *
       * @example
       * ```ts
       * import { Account, Client, erc7821Actions, http } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const account = Account.fromPrivateKey('0x…')
       *
       * const client = Client.create({
       *   account,
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(erc7821Actions())
       * const hash = await client.erc7821.execute({
       *   address: account.address,
       *   calls: [
       *     { data: '0xdeadbeef', to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8' },
       *     { to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', value: 69420n },
       *   ],
       * })
       * ```
       */
      execute: <const calls extends readonly unknown[]>(
        options: erc7821.execute.Options<calls, chain>,
      ) => Promise<erc7821.execute.ReturnType>
      /**
       * Executes batches of call(s) using "batch of batches" mode on an
       * [ERC-7821-compatible contract](https://eips.ethereum.org/EIPS/eip-7821).
       *
       * @example
       * ```ts
       * import { Account, Client, erc7821Actions, http } from 'viem'
       * import { mainnet } from 'viem/chains'
       * import { Value } from 'viem/utils'
       *
       * const account = Account.fromPrivateKey('0x…')
       *
       * const client = Client.create({
       *   account,
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(erc7821Actions())
       * const hash = await client.erc7821.executeBatches({
       *   address: account.address,
       *   batches: [
       *     {
       *       calls: [
       *         {
       *           to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
       *           value: Value.fromEther('1'),
       *         },
       *       ],
       *     },
       *     {
       *       calls: [
       *         {
       *           data: '0xdeadbeef',
       *           to: '0xcb98643b8786950F0461f3B0edf99D88F274574D',
       *         },
       *       ],
       *       opData: '0xcafebabe',
       *     },
       *   ],
       * })
       * ```
       */
      executeBatches: <
        const batches extends readonly erc7821.executeBatches.Batch[],
      >(
        options: erc7821.executeBatches.Options<batches, chain>,
      ) => Promise<erc7821.executeBatches.ReturnType>
      /**
       * Checks if a contract supports an
       * [ERC-7821](https://eips.ethereum.org/EIPS/eip-7821) execution mode.
       *
       * @example
       * ```ts
       * import { Client, erc7821Actions, http } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(erc7821Actions())
       * const supported = await client.erc7821.supportsExecutionMode({
       *   address: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
       * })
       * ```
       */
      supportsExecutionMode: (
        options: erc7821.supportsExecutionMode.Options,
      ) => Promise<erc7821.supportsExecutionMode.ReturnType>
    }
  }
}
