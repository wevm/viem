import type * as Client from '../../Client.js'
import { dropTransaction } from '../test/dropTransaction.js'
import { dumpState } from '../test/dumpState.js'
import { getAutomine } from '../test/getAutomine.js'
import { getTxpoolStatus } from '../test/getTxpoolStatus.js'
import { impersonateAccount } from '../test/impersonateAccount.js'
import { increaseTime } from '../test/increaseTime.js'
import { inspectTxpool } from '../test/inspectTxpool.js'
import type * as Mode from '../test/internal/mode.js'
import { loadState } from '../test/loadState.js'
import { mine } from '../test/mine.js'
import { removeBlockTimestampInterval } from '../test/removeBlockTimestampInterval.js'
import { reset } from '../test/reset.js'
import { revert } from '../test/revert.js'
import { setAutomine } from '../test/setAutomine.js'
import { setBalance } from '../test/setBalance.js'
import { setBlockGasLimit } from '../test/setBlockGasLimit.js'
import { setBlockTimestampInterval } from '../test/setBlockTimestampInterval.js'
import { setCode } from '../test/setCode.js'
import { setCoinbase } from '../test/setCoinbase.js'
import { setIntervalMining } from '../test/setIntervalMining.js'
import { setLoggingEnabled } from '../test/setLoggingEnabled.js'
import { setMinGasPrice } from '../test/setMinGasPrice.js'
import { setNextBlockBaseFeePerGas } from '../test/setNextBlockBaseFeePerGas.js'
import { setNextBlockTimestamp } from '../test/setNextBlockTimestamp.js'
import { setNonce } from '../test/setNonce.js'
import { setRpcUrl } from '../test/setRpcUrl.js'
import { setStorageAt } from '../test/setStorageAt.js'
import { snapshot } from '../test/snapshot.js'
import { stopImpersonatingAccount } from '../test/stopImpersonatingAccount.js'

/** Action options with `mode` injected by the decorator stripped out. */
type Without<options> = Omit<options, 'mode'>

/**
 * Bag of test actions (anvil/hardhat/ganache) bound to a {@link Client}, with
 * the decorator's `mode` injected into every action. Pass to `Client.create`'s
 * `.extend`.
 *
 * @example
 * ```ts
 * import { Client, http, testActions } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http(),
 * }).extend(testActions({ mode: 'anvil' }))
 * await client.mine({ blocks: 1 })
 * ```
 */
export function testActions(options: testActions.Options = {}) {
  const { mode = 'anvil' } = options
  return (client: Client.Client): testActions.Decorator => ({
    dropTransaction: (options) => dropTransaction(client, { ...options, mode }),
    dumpState: () => dumpState(client, { mode }),
    getAutomine: () => getAutomine(client, { mode }),
    getTxpoolStatus: () => getTxpoolStatus(client),
    impersonateAccount: (options) =>
      impersonateAccount(client, { ...options, mode }),
    increaseTime: (options) => increaseTime(client, options),
    inspectTxpool: () => inspectTxpool(client),
    loadState: (options) => loadState(client, { ...options, mode }),
    mine: (options) => mine(client, { ...options, mode }),
    removeBlockTimestampInterval: () =>
      removeBlockTimestampInterval(client, { mode }),
    reset: (options) => reset(client, { ...options, mode }),
    revert: (options) => revert(client, options),
    setAutomine: (options) => setAutomine(client, { ...options, mode }),
    setBalance: (options) => setBalance(client, { ...options, mode }),
    setBlockGasLimit: (options) =>
      setBlockGasLimit(client, { ...options, mode }),
    setBlockTimestampInterval: (options) =>
      setBlockTimestampInterval(client, { ...options, mode }),
    setCode: (options) => setCode(client, { ...options, mode }),
    setCoinbase: (options) => setCoinbase(client, { ...options, mode }),
    setIntervalMining: (options) =>
      setIntervalMining(client, { ...options, mode }),
    setLoggingEnabled: (options) =>
      setLoggingEnabled(client, { ...options, mode }),
    setMinGasPrice: (options) => setMinGasPrice(client, { ...options, mode }),
    setNextBlockBaseFeePerGas: (options) =>
      setNextBlockBaseFeePerGas(client, { ...options, mode }),
    setNextBlockTimestamp: (options) => setNextBlockTimestamp(client, options),
    setNonce: (options) => setNonce(client, { ...options, mode }),
    setRpcUrl: (options) => setRpcUrl(client, { ...options, mode }),
    setStorageAt: (options) => setStorageAt(client, { ...options, mode }),
    snapshot: () => snapshot(client),
    stopImpersonatingAccount: (options) =>
      stopImpersonatingAccount(client, { ...options, mode }),
  })
}

export declare namespace testActions {
  type Options = {
    /** Test node mode. @default 'anvil' */
    mode?: Mode.Mode | undefined
  }

  type Decorator = {
    /**
     * Removes a transaction from the mempool.
     *
     * @example
     * ```ts
     * import { Client, http, testActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(testActions())
     * await client.dropTransaction({
     *   hash: '0xe58dceb6b20b03965bb678e27d141e151d7d4efc2334c2d6a49b9fac523f7364',
     * })
     * ```
     */
    dropTransaction: (
      options: Without<dropTransaction.Options>,
    ) => Promise<void>
    /**
     * Serializes the current state (including contracts code, contract's
     * storage, accounts properties, etc.) into a savable data blob.
     *
     * @example
     * ```ts
     * import { Client, http, testActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(testActions())
     * const state = await client.dumpState()
     * ```
     */
    dumpState: () => Promise<dumpState.ReturnType>
    /**
     * Returns the automatic mining status of the node.
     *
     * @example
     * ```ts
     * import { Client, http, testActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(testActions())
     * const isAutomining = await client.getAutomine()
     * ```
     */
    getAutomine: () => Promise<getAutomine.ReturnType>
    /**
     * Returns a summary of all the transactions currently pending for inclusion
     * in the next block(s), as well as the ones that are being scheduled for
     * future execution only.
     *
     * @example
     * ```ts
     * import { Client, http, testActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(testActions())
     * const status = await client.getTxpoolStatus()
     * ```
     */
    getTxpoolStatus: () => Promise<getTxpoolStatus.ReturnType>
    /**
     * Impersonate an account or contract address. This lets you send
     * transactions from that account even if you don't have access to its
     * private key.
     *
     * @example
     * ```ts
     * import { Client, http, testActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(testActions())
     * await client.impersonateAccount({
     *   address: '0xe846c6fcf817734ca4527b28ccb4aea2b6663c79',
     * })
     * ```
     */
    impersonateAccount: (
      options: Without<impersonateAccount.Options>,
    ) => Promise<void>
    /**
     * Jump forward in time by the given amount of time, in seconds.
     *
     * @example
     * ```ts
     * import { Client, http, testActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(testActions())
     * await client.increaseTime({ seconds: 420 })
     * ```
     */
    increaseTime: (
      options: increaseTime.Options,
    ) => Promise<increaseTime.ReturnType>
    /**
     * Returns a summary of all the transactions currently pending for inclusion
     * in the next block(s), as well as the ones that are being scheduled for
     * future execution only.
     *
     * @example
     * ```ts
     * import { Client, http, testActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(testActions())
     * const txpool = await client.inspectTxpool()
     * ```
     */
    inspectTxpool: () => Promise<inspectTxpool.ReturnType>
    /**
     * Adds state previously dumped with `dumpState` to the current chain.
     *
     * @example
     * ```ts
     * import { Client, http, testActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(testActions())
     * await client.loadState({ state: '0x...' })
     * ```
     */
    loadState: (options: Without<loadState.Options>) => Promise<void>
    /**
     * Mine a specified number of blocks.
     *
     * @example
     * ```ts
     * import { Client, http, testActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(testActions())
     * await client.mine({ blocks: 1 })
     * ```
     */
    mine: (options: Without<mine.Options>) => Promise<void>
    /**
     * Removes `setBlockTimestampInterval` if it exists.
     *
     * @example
     * ```ts
     * import { Client, http, testActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(testActions())
     * await client.removeBlockTimestampInterval()
     * ```
     */
    removeBlockTimestampInterval: () => Promise<void>
    /**
     * Resets fork back to its original state.
     *
     * @example
     * ```ts
     * import { Client, http, testActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(testActions())
     * await client.reset({ blockNumber: 69420n })
     * ```
     */
    reset: (options?: Without<reset.Options> | undefined) => Promise<void>
    /**
     * Revert the state of the blockchain at the current block.
     *
     * @example
     * ```ts
     * import { Client, http, testActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(testActions())
     * await client.revert({ id: '0x1' })
     * ```
     */
    revert: (options: revert.Options) => Promise<void>
    /**
     * Enables or disables the automatic mining of new blocks with each new
     * transaction submitted to the network.
     *
     * @example
     * ```ts
     * import { Client, http, testActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(testActions())
     * await client.setAutomine({ enabled: true })
     * ```
     */
    setAutomine: (options: Without<setAutomine.Options>) => Promise<void>
    /**
     * Modifies the balance of an account.
     *
     * @example
     * ```ts
     * import { Client, http, testActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(testActions())
     * await client.setBalance({
     *   address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
     *   value: 1_000_000_000_000_000_000n,
     * })
     * ```
     */
    setBalance: (options: Without<setBalance.Options>) => Promise<void>
    /**
     * Sets the block's gas limit.
     *
     * @example
     * ```ts
     * import { Client, http, testActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(testActions())
     * await client.setBlockGasLimit({ gasLimit: 420_000n })
     * ```
     */
    setBlockGasLimit: (
      options: Without<setBlockGasLimit.Options>,
    ) => Promise<void>
    /**
     * Similar to `increaseTime`, but sets a block timestamp `interval`. The
     * timestamp of future blocks will be computed as `lastBlock_timestamp` +
     * `interval`.
     *
     * @example
     * ```ts
     * import { Client, http, testActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(testActions())
     * await client.setBlockTimestampInterval({ interval: 5 })
     * ```
     */
    setBlockTimestampInterval: (
      options: Without<setBlockTimestampInterval.Options>,
    ) => Promise<void>
    /**
     * Modifies the bytecode stored at an account's address.
     *
     * @example
     * ```ts
     * import { Client, http, testActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(testActions())
     * await client.setCode({
     *   address: '0xe846c6fcf817734ca4527b28ccb4aea2b6663c79',
     *   bytecode: '0x60806040...',
     * })
     * ```
     */
    setCode: (options: Without<setCode.Options>) => Promise<void>
    /**
     * Sets the coinbase address to be used in new blocks.
     *
     * @example
     * ```ts
     * import { Client, http, testActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(testActions())
     * await client.setCoinbase({
     *   address: '0xe846c6fcf817734ca4527b28ccb4aea2b6663c79',
     * })
     * ```
     */
    setCoinbase: (options: Without<setCoinbase.Options>) => Promise<void>
    /**
     * Sets the automatic mining interval (in seconds) of blocks. Setting the
     * interval to 0 will disable automatic mining.
     *
     * @example
     * ```ts
     * import { Client, http, testActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(testActions())
     * await client.setIntervalMining({ interval: 5 })
     * ```
     */
    setIntervalMining: (
      options: Without<setIntervalMining.Options>,
    ) => Promise<void>
    /**
     * Enable or disable logging on the test node network.
     *
     * @example
     * ```ts
     * import { Client, http, testActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(testActions())
     * await client.setLoggingEnabled({ enabled: true })
     * ```
     */
    setLoggingEnabled: (
      options: Without<setLoggingEnabled.Options>,
    ) => Promise<void>
    /**
     * Change the minimum gas price accepted by the network (in wei).
     *
     * @example
     * ```ts
     * import { Client, http, testActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(testActions())
     * await client.setMinGasPrice({ gasPrice: 1_000_000_000n })
     * ```
     */
    setMinGasPrice: (options: Without<setMinGasPrice.Options>) => Promise<void>
    /**
     * Sets the next block's base fee per gas.
     *
     * @example
     * ```ts
     * import { Client, http, testActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(testActions())
     * await client.setNextBlockBaseFeePerGas({ baseFeePerGas: 1_000_000_000n })
     * ```
     */
    setNextBlockBaseFeePerGas: (
      options: Without<setNextBlockBaseFeePerGas.Options>,
    ) => Promise<void>
    /**
     * Sets the next block's timestamp.
     *
     * @example
     * ```ts
     * import { Client, http, testActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(testActions())
     * await client.setNextBlockTimestamp({ timestamp: 1671744314n })
     * ```
     */
    setNextBlockTimestamp: (
      options: setNextBlockTimestamp.Options,
    ) => Promise<void>
    /**
     * Modifies (overrides) the nonce of an account.
     *
     * @example
     * ```ts
     * import { Client, http, testActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(testActions())
     * await client.setNonce({
     *   address: '0xe846c6fcf817734ca4527b28ccb4aea2b6663c79',
     *   nonce: 420,
     * })
     * ```
     */
    setNonce: (options: Without<setNonce.Options>) => Promise<void>
    /**
     * Sets the backend RPC URL.
     *
     * @example
     * ```ts
     * import { Client, http, testActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(testActions())
     * await client.setRpcUrl({ jsonRpcUrl: 'https://eth.merkle.io' })
     * ```
     */
    setRpcUrl: (options: Without<setRpcUrl.Options>) => Promise<void>
    /**
     * Writes to a slot of an account's storage.
     *
     * @example
     * ```ts
     * import { Client, http, testActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(testActions())
     * await client.setStorageAt({
     *   address: '0xe846c6fcf817734ca4527b28ccb4aea2b6663c79',
     *   index: 2,
     *   value: '0x0000000000000000000000000000000000000000000000000000000000000069',
     * })
     * ```
     */
    setStorageAt: (options: Without<setStorageAt.Options>) => Promise<void>
    /**
     * Snapshot the state of the blockchain at the current block.
     *
     * @example
     * ```ts
     * import { Client, http, testActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(testActions())
     * const id = await client.snapshot()
     * ```
     */
    snapshot: () => Promise<snapshot.ReturnType>
    /**
     * Stop impersonating an account after having previously used
     * `impersonateAccount`.
     *
     * @example
     * ```ts
     * import { Client, http, testActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(testActions())
     * await client.stopImpersonatingAccount({
     *   address: '0xe846c6fcf817734ca4527b28ccb4aea2b6663c79',
     * })
     * ```
     */
    stopImpersonatingAccount: (
      options: Without<stopImpersonatingAccount.Options>,
    ) => Promise<void>
  }
}
