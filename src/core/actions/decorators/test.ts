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
 * import { Client, http, Actions } from 'viem'
 *
 * const client = Client.create({ transport: http() }).extend(
 *   Actions.testActions({ mode: 'anvil' }),
 * )
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
    dropTransaction: (
      options: Without<dropTransaction.Options>,
    ) => Promise<void>
    dumpState: () => Promise<dumpState.ReturnType>
    getAutomine: () => Promise<getAutomine.ReturnType>
    getTxpoolStatus: () => Promise<getTxpoolStatus.ReturnType>
    impersonateAccount: (
      options: Without<impersonateAccount.Options>,
    ) => Promise<void>
    increaseTime: (
      options: increaseTime.Options,
    ) => Promise<increaseTime.ReturnType>
    inspectTxpool: () => Promise<inspectTxpool.ReturnType>
    loadState: (options: Without<loadState.Options>) => Promise<void>
    mine: (options: Without<mine.Options>) => Promise<void>
    removeBlockTimestampInterval: () => Promise<void>
    reset: (options?: Without<reset.Options> | undefined) => Promise<void>
    revert: (options: revert.Options) => Promise<void>
    setAutomine: (options: Without<setAutomine.Options>) => Promise<void>
    setBalance: (options: Without<setBalance.Options>) => Promise<void>
    setBlockGasLimit: (
      options: Without<setBlockGasLimit.Options>,
    ) => Promise<void>
    setBlockTimestampInterval: (
      options: Without<setBlockTimestampInterval.Options>,
    ) => Promise<void>
    setCode: (options: Without<setCode.Options>) => Promise<void>
    setCoinbase: (options: Without<setCoinbase.Options>) => Promise<void>
    setIntervalMining: (
      options: Without<setIntervalMining.Options>,
    ) => Promise<void>
    setLoggingEnabled: (
      options: Without<setLoggingEnabled.Options>,
    ) => Promise<void>
    setMinGasPrice: (options: Without<setMinGasPrice.Options>) => Promise<void>
    setNextBlockBaseFeePerGas: (
      options: Without<setNextBlockBaseFeePerGas.Options>,
    ) => Promise<void>
    setNextBlockTimestamp: (
      options: setNextBlockTimestamp.Options,
    ) => Promise<void>
    setNonce: (options: Without<setNonce.Options>) => Promise<void>
    setRpcUrl: (options: Without<setRpcUrl.Options>) => Promise<void>
    setStorageAt: (options: Without<setStorageAt.Options>) => Promise<void>
    snapshot: () => Promise<snapshot.ReturnType>
    stopImpersonatingAccount: (
      options: Without<stopImpersonatingAccount.Options>,
    ) => Promise<void>
  }
}
