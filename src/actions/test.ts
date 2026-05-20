import type * as RpcSchema from 'ox/RpcSchema'

import type * as Account from '../core/Account.js'
import type * as Chain from '../core/Chain.js'
import type * as Client from '../core/Client.js'
import type * as Transport from '../core/Transport.js'
import type * as Mode from './test/internal/mode.js'
import { getAutomine } from './test/getAutomine.js'
import { increaseTime } from './test/increaseTime.js'
import { mine } from './test/mine.js'
import { removeBlockTimestampInterval } from './test/removeBlockTimestampInterval.js'
import { revert } from './test/revert.js'
import { setAutomine } from './test/setAutomine.js'
import { setBalance } from './test/setBalance.js'
import { setBlockTimestampInterval } from './test/setBlockTimestampInterval.js'
import { setCode } from './test/setCode.js'
import { setIntervalMining } from './test/setIntervalMining.js'
import { setNextBlockTimestamp } from './test/setNextBlockTimestamp.js'
import { setNonce } from './test/setNonce.js'
import { setStorageAt } from './test/setStorageAt.js'
import { snapshot } from './test/snapshot.js'

/** Test action methods attached by `testActions`. */
export type TestActions = {
  /**
   * Returns whether automining is enabled.
   *
   * @example
   * ```ts twoslash
   * import { Client, http, testActions } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = Client.create({
   *   chain: mainnet,
   *   transport: http()
   * }).extend(testActions())
   *
   * const enabled = await client.test.getAutomine()
   * ```
   *
   * @returns Whether automining is enabled.
   */
  getAutomine: () => getAutomine.ReturnType
  /**
   * Increases the next block timestamp by a number of seconds.
   *
   * @example
   * ```ts twoslash
   * import { Client, http, testActions } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = Client.create({
   *   chain: mainnet,
   *   transport: http()
   * }).extend(testActions())
   *
   * await client.test.increaseTime({ seconds: 60n })
   * ```
   *
   * @param options - Options.
   * @returns Total time offset, in seconds.
   */
  increaseTime: (options: increaseTime.Options) => increaseTime.ReturnType
  /**
   * Mines a number of blocks.
   *
   * @example
   * ```ts twoslash
   * import { Client, http, testActions } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = Client.create({
   *   chain: mainnet,
   *   transport: http()
   * }).extend(testActions({ mode: 'anvil' }))
   *
   * await client.test.mine({ blocks: 1n })
   * ```
   *
   * @param options - Options.
   * @returns Nothing.
   */
  mine: (options: mine.Options) => mine.ReturnType
  /**
   * Removes the configured block timestamp interval.
   *
   * @example
   * ```ts twoslash
   * import { Client, http, testActions } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = Client.create({
   *   chain: mainnet,
   *   transport: http()
   * }).extend(testActions())
   *
   * await client.test.removeBlockTimestampInterval()
   * ```
   *
   * @returns Nothing.
   */
  removeBlockTimestampInterval: () => removeBlockTimestampInterval.ReturnType
  /**
   * Reverts the chain state to a previous snapshot.
   *
   * @example
   * ```ts twoslash
   * import { Client, http, testActions } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = Client.create({
   *   chain: mainnet,
   *   transport: http()
   * }).extend(testActions())
   *
   * const id = await client.test.snapshot()
   * await client.test.revert({ id })
   * ```
   *
   * @param options - Options.
   * @returns Nothing.
   */
  revert: (options: revert.Options) => revert.ReturnType
  /**
   * Enables or disables automining.
   *
   * @example
   * ```ts twoslash
   * import { Client, http, testActions } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = Client.create({
   *   chain: mainnet,
   *   transport: http()
   * }).extend(testActions())
   *
   * await client.test.setAutomine(true)
   * ```
   *
   * @param enabled - Whether automining is enabled.
   * @returns Nothing.
   */
  setAutomine: (enabled: boolean) => setAutomine.ReturnType
  /**
   * Sets an account balance.
   *
   * @example
   * ```ts twoslash
   * import { Client, http, testActions } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = Client.create({
   *   chain: mainnet,
   *   transport: http()
   * }).extend(testActions())
   *
   * await client.test.setBalance({
   *   address: '0x0000000000000000000000000000000000000000',
   *   value: 1n
   * })
   * ```
   *
   * @param options - Options.
   * @returns Nothing.
   */
  setBalance: (options: setBalance.Options) => setBalance.ReturnType
  /**
   * Sets the timestamp interval for each mined block.
   *
   * @example
   * ```ts twoslash
   * import { Client, http, testActions } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = Client.create({
   *   chain: mainnet,
   *   transport: http()
   * }).extend(testActions())
   *
   * await client.test.setBlockTimestampInterval({
   *   interval: 12
   * })
   * ```
   *
   * @param options - Options.
   * @returns Nothing.
   */
  setBlockTimestampInterval: (
    options: setBlockTimestampInterval.Options,
  ) => setBlockTimestampInterval.ReturnType
  /**
   * Sets the bytecode at an account address.
   *
   * @example
   * ```ts twoslash
   * import { Client, http, testActions } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = Client.create({
   *   chain: mainnet,
   *   transport: http()
   * }).extend(testActions())
   *
   * await client.test.setCode({
   *   address: '0x0000000000000000000000000000000000000000',
   *   bytecode: '0x6001600055'
   * })
   * ```
   *
   * @param options - Options.
   * @returns Nothing.
   */
  setCode: (options: setCode.Options) => setCode.ReturnType
  /**
   * Sets interval mining.
   *
   * @example
   * ```ts twoslash
   * import { Client, http, testActions } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = Client.create({
   *   chain: mainnet,
   *   transport: http()
   * }).extend(testActions())
   *
   * await client.test.setIntervalMining({ interval: 1 })
   * ```
   *
   * @param options - Options.
   * @returns Nothing.
   */
  setIntervalMining: (
    options: setIntervalMining.Options,
  ) => setIntervalMining.ReturnType
  /**
   * Sets the timestamp for the next block.
   *
   * @example
   * ```ts twoslash
   * import { Client, http, testActions } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = Client.create({
   *   chain: mainnet,
   *   transport: http()
   * }).extend(testActions())
   *
   * await client.test.setNextBlockTimestamp({
   *   timestamp: 1_700_000_000n
   * })
   * ```
   *
   * @param options - Options.
   * @returns Nothing.
   */
  setNextBlockTimestamp: (
    options: setNextBlockTimestamp.Options,
  ) => setNextBlockTimestamp.ReturnType
  /**
   * Sets an account nonce.
   *
   * @example
   * ```ts twoslash
   * import { Client, http, testActions } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = Client.create({
   *   chain: mainnet,
   *   transport: http()
   * }).extend(testActions())
   *
   * await client.test.setNonce({
   *   address: '0x0000000000000000000000000000000000000000',
   *   nonce: 42n
   * })
   * ```
   *
   * @param options - Options.
   * @returns Nothing.
   */
  setNonce: (options: setNonce.Options) => setNonce.ReturnType
  /**
   * Sets a storage slot value.
   *
   * @example
   * ```ts twoslash
   * import { Client, http, testActions } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = Client.create({
   *   chain: mainnet,
   *   transport: http()
   * }).extend(testActions())
   *
   * await client.test.setStorageAt({
   *   address: '0x0000000000000000000000000000000000000000',
   *   slot: 0n,
   *   value:
   *     '0x0000000000000000000000000000000000000000000000000000000000000000'
   * })
   * ```
   *
   * @param options - Options.
   * @returns Nothing.
   */
  setStorageAt: (options: setStorageAt.Options) => setStorageAt.ReturnType
  /**
   * Snapshots the current chain state.
   *
   * @example
   * ```ts twoslash
   * import { Client, http, testActions } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = Client.create({
   *   chain: mainnet,
   *   transport: http()
   * }).extend(testActions())
   *
   * const id = await client.test.snapshot()
   * ```
   *
   * @returns Snapshot ID.
   */
  snapshot: () => snapshot.ReturnType
}

/**
 * Creates a test action decorator.
 *
 * @example
 * ```ts twoslash
 * import { Client, http, testActions } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http()
 * }).extend(testActions({ mode: 'anvil' }))
 *
 * await client.test.mine({ blocks: 1n })
 * ```
 *
 * @param options - Options.
 * @returns Client decorator.
 */
export function testActions(options: testActions.Options = {}) {
  const { mode } = options
  return <
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
    account extends Account.Account | undefined = Account.Account | undefined,
    transport extends Transport.Transport = Transport.Transport,
    schema extends RpcSchema.Generic | undefined = undefined,
  >(
    client: Client.Client<chain, account, transport, schema>,
  ) => {
    const actionClient = client as unknown as Client.Client<chain>
    const actions: TestActions = {
      getAutomine: () => getAutomine(actionClient, { mode }),
      increaseTime: (options: increaseTime.Options) =>
        increaseTime(actionClient, { mode, ...options }),
      mine: (options: mine.Options) => mine(actionClient, { mode, ...options }),
      removeBlockTimestampInterval: () =>
        removeBlockTimestampInterval(actionClient, { mode }),
      revert: (options: revert.Options) => revert(actionClient, options),
      setAutomine: (enabled: boolean) =>
        setAutomine(actionClient, enabled, { mode }),
      setBalance: (options: setBalance.Options) =>
        setBalance(actionClient, { mode, ...options }),
      setBlockTimestampInterval: (options: setBlockTimestampInterval.Options) =>
        setBlockTimestampInterval(actionClient, { mode, ...options }),
      setCode: (options: setCode.Options) =>
        setCode(actionClient, { mode, ...options }),
      setIntervalMining: (options: setIntervalMining.Options) =>
        setIntervalMining(actionClient, { mode, ...options }),
      setNextBlockTimestamp: (options: setNextBlockTimestamp.Options) =>
        setNextBlockTimestamp(actionClient, { mode, ...options }),
      setNonce: (options: setNonce.Options) =>
        setNonce(actionClient, { mode, ...options }),
      setStorageAt: (options: setStorageAt.Options) =>
        setStorageAt(actionClient, { mode, ...options }),
      snapshot: () => snapshot(actionClient),
    }

    return { test: actions }
  }
}

export declare namespace testActions {
  type Options = Mode.Options
}

export {
  getAutomine,
  increaseTime,
  mine,
  removeBlockTimestampInterval,
  revert,
  setAutomine,
  setBalance,
  setBlockTimestampInterval,
  setCode,
  setIntervalMining,
  setNextBlockTimestamp,
  setNonce,
  setStorageAt,
  snapshot,
}
