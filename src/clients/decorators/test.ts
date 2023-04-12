import type {
  DropTransactionParameters,
  GetAutomineReturnType,
  GetTxpoolContentReturnType,
  GetTxpoolStatusReturnType,
  ImpersonateAccountParameters,
  IncreaseTimeParameters,
  InspectTxpoolReturnType,
  MineParameters,
  ResetParameters,
  RevertParameters,
  SendUnsignedTransactionParameters,
  SendUnsignedTransactionReturnType,
  SetBalanceParameters,
  SetBlockGasLimitParameters,
  SetBlockTimestampIntervalParameters,
  SetCodeParameters,
  SetCoinbaseParameters,
  SetIntervalMiningParameters,
  SetMinGasPriceParameters,
  SetNextBlockBaseFeePerGasParameters,
  SetNextBlockTimestampParameters,
  SetNonceParameters,
  SetStorageAtParameters,
  StopImpersonatingAccountParameters,
} from '../../actions/test/index.js'
import {
  dropTransaction,
  getAutomine,
  getTxpoolContent,
  getTxpoolStatus,
  impersonateAccount,
  increaseTime,
  inspectTxpool,
  mine,
  removeBlockTimestampInterval,
  reset,
  revert,
  sendUnsignedTransaction,
  setAutomine,
  setBalance,
  setBlockGasLimit,
  setBlockTimestampInterval,
  setCode,
  setCoinbase,
  setIntervalMining,
  setLoggingEnabled,
  setMinGasPrice,
  setNextBlockBaseFeePerGas,
  setNextBlockTimestamp,
  setNonce,
  setRpcUrl,
  setStorageAt,
  snapshot,
  stopImpersonatingAccount,
} from '../../actions/test/index.js'
import type { Chain, Quantity } from '../../types/index.js'
import type { TestClient, TestClientMode } from '../createTestClient.js'
import type { Transport } from '../transports/index.js'

export type TestActions = {
  /**
   * Removes a transaction from the mempool.
   *
   * - Docs: https://viem.sh/docs/actions/test/dropTransaction.html
   *
   * @param parameters - {@link DropTransactionParameters}
   *
   * @example
   * import { createTestClient, http } from 'viem'
   * import { foundry } from 'viem/chains'
   *
   * const client = createTestClient({
   *   mode: 'anvil',
   *   chain: 'foundry',
   *   transport: http(),
   * })
   * await client.dropTransaction({
   *   hash: '0xe58dceb6b20b03965bb678e27d141e151d7d4efc2334c2d6a49b9fac523f7364'
   * })
   */
  dropTransaction: (args: DropTransactionParameters) => Promise<void>
  /**
   * Returns the automatic mining status of the node.
   *
   * - Docs: https://viem.sh/docs/actions/test/getAutomine.html
   *
   * @returns Whether or not the node is auto mining. {@link GetAutomineReturnType}
   *
   * @example
   * import { createTestClient, http } from 'viem'
   * import { foundry } from 'viem/chains'
   *
   * const client = createTestClient({
   *   mode: 'anvil',
   *   chain: 'foundry',
   *   transport: http(),
   * })
   * const isAutomining = await client.getAutomine()
   */
  getAutomine: () => Promise<GetAutomineReturnType>
  /**
   * Returns the details of all transactions currently pending for inclusion in the next block(s), as well as the ones that are being scheduled for future execution only.
   *
   * - Docs: https://viem.sh/docs/actions/test/getTxpoolContent.html
   *
   * @returns Transaction pool content. {@link GetTxpoolContentReturnType}
   *
   * @example
   * import { createTestClient, http } from 'viem'
   * import { foundry } from 'viem/chains'
   *
   * const client = createTestClient({
   *   mode: 'anvil',
   *   chain: 'foundry',
   *   transport: http(),
   * })
   * const content = await client.getTxpoolContent()
   */
  getTxpoolContent: () => Promise<GetTxpoolContentReturnType>
  /**
   * Returns a summary of all the transactions currently pending for inclusion in the next block(s), as well as the ones that are being scheduled for future execution only.
   *
   * - Docs: https://viem.sh/docs/actions/test/getTxpoolStatus.html
   *
   * @returns Transaction pool status. {@link GetTxpoolStatusReturnType}
   *
   * @example
   * import { createTestClient, http } from 'viem'
   * import { foundry } from 'viem/chains'
   *
   * const client = createTestClient({
   *   mode: 'anvil',
   *   chain: 'foundry',
   *   transport: http(),
   * })
   * const status = await client.getTxpoolStatus()
   */
  getTxpoolStatus: () => Promise<GetTxpoolStatusReturnType>
  /**
   * Impersonate an account or contract address. This lets you send transactions from that account even if you don't have access to its private key.
   *
   * - Docs: https://viem.sh/docs/actions/test/impersonateAccount.html
   *
   * @param parameters - {@link ImpersonateAccountParameters}
   *
   * @example
   * import { createTestClient, http } from 'viem'
   * import { foundry } from 'viem/chains'
   *
   * const client = createTestClient({
   *   mode: 'anvil',
   *   chain: 'foundry',
   *   transport: http(),
   * })
   * await client.impersonateAccount({
   *   address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   * })
   */
  impersonateAccount: (args: ImpersonateAccountParameters) => Promise<void>
  /**
   * Jump forward in time by the given amount of time, in seconds.
   *
   * - Docs: https://viem.sh/docs/actions/test/increaseTime.html
   *
   * @param parameters – {@link IncreaseTimeParameters}
   *
   * @example
   * import { createTestClient, http } from 'viem'
   * import { foundry } from 'viem/chains'
   *
   * const client = createTestClient({
   *   mode: 'anvil',
   *   chain: 'foundry',
   *   transport: http(),
   * })
   * await client.increaseTime({
   *   seconds: 420,
   * })
   */
  increaseTime: (args: IncreaseTimeParameters) => Promise<Quantity>
  /**
   * Returns a summary of all the transactions currently pending for inclusion in the next block(s), as well as the ones that are being scheduled for future execution only.
   *
   * - Docs: https://viem.sh/docs/actions/test/inspectTxpool.html
   *
   * @returns Transaction pool inspection data. {@link InspectTxpoolReturnType}
   *
   * @example
   * import { createTestClient, http } from 'viem'
   * import { foundry } from 'viem/chains'
   *
   * const client = createTestClient({
   *   mode: 'anvil',
   *   chain: 'foundry',
   *   transport: http(),
   * })
   * const data = await client.inspectTxpool()
   */
  inspectTxpool: () => Promise<InspectTxpoolReturnType>
  /**
   * Mine a specified number of blocks.
   *
   * - Docs: https://viem.sh/docs/actions/test/mine.html
   *
   * @param client - Client to use
   * @param parameters – {@link MineParameters}
   *
   * @example
   * import { createTestClient, http } from 'viem'
   * import { foundry } from 'viem/chains'
   *
   * const client = createTestClient({
   *   mode: 'anvil',
   *   chain: 'foundry',
   *   transport: http(),
   * })
   * await client.mine({ blocks: 1 })
   */
  mine: (args: MineParameters) => Promise<void>
  /**
   * Removes [`setBlockTimestampInterval`](https://viem.sh/docs/actions/test/setBlockTimestampInterval.html) if it exists.
   *
   * - Docs: https://viem.sh/docs/actions/test/removeBlockTimestampInterval.html
   *
   * @example
   * import { createTestClient, http } from 'viem'
   * import { foundry } from 'viem/chains'
   * import { removeBlockTimestampInterval } from 'viem/test'
   *
   * const client = createTestClient({
   *   mode: 'anvil',
   *   chain: 'foundry',
   *   transport: http(),
   * })
   * await client.removeBlockTimestampInterval()
   */
  removeBlockTimestampInterval: () => Promise<void>
  /**
   * Resets fork back to its original state.
   *
   * - Docs: https://viem.sh/docs/actions/test/reset.html
   *
   * @param parameters – {@link ResetParameters}
   *
   * @example
   * import { createTestClient, http } from 'viem'
   * import { foundry } from 'viem/chains'
   *
   * const client = createTestClient({
   *   mode: 'anvil',
   *   chain: 'foundry',
   *   transport: http(),
   * })
   * await client.reset({ blockNumber: 69420n })
   */
  reset: (args?: ResetParameters) => Promise<void>
  /**
   * Revert the state of the blockchain at the current block.
   *
   * - Docs: https://viem.sh/docs/actions/test/revert.html
   *
   * @param parameters – {@link RevertParameters}
   *
   * @example
   * import { createTestClient, http } from 'viem'
   * import { foundry } from 'viem/chains'
   *
   * const client = createTestClient({
   *   mode: 'anvil',
   *   chain: 'foundry',
   *   transport: http(),
   * })
   * await client.revert({ id: '0x…' })
   */
  revert: (args: RevertParameters) => Promise<void>
  /**
   * Returns the details of all transactions currently pending for inclusion in the next block(s), as well as the ones that are being scheduled for future execution only.
   *
   * - Docs: https://viem.sh/docs/actions/test/getTxpoolContent.html
   *
   * @param parameters – {@link SendUnsignedTransactionParameters}
   * @returns The transaction hash. {@link SendUnsignedTransactionReturnType}
   *
   * @example
   * import { createTestClient, http } from 'viem'
   * import { foundry } from 'viem/chains'
   *
   * const client = createTestClient({
   *   mode: 'anvil',
   *   chain: 'foundry',
   *   transport: http(),
   * })
   * const hash = await client.sendUnsignedTransaction({
   *   from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
   *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
   *   value: 1000000000000000000n,
   * })
   */
  sendUnsignedTransaction: (
    args: SendUnsignedTransactionParameters,
  ) => Promise<SendUnsignedTransactionReturnType>
  /**
   * Enables or disables the automatic mining of new blocks with each new transaction submitted to the network.
   *
   * - Docs: https://viem.sh/docs/actions/test/setAutomine.html
   *
   * @example
   * import { createTestClient, http } from 'viem'
   * import { foundry } from 'viem/chains'
   *
   * const client = createTestClient({
   *   mode: 'anvil',
   *   chain: 'foundry',
   *   transport: http(),
   * })
   * await client.setAutomine()
   */
  setAutomine: (args: boolean) => Promise<void>
  /**
   * Modifies the balance of an account.
   *
   * - Docs: https://viem.sh/docs/actions/test/setBalance.html
   *
   * @param parameters – {@link SetBalanceParameters}
   *
   * @example
   * import { createTestClient, http, parseEther } from 'viem'
   * import { foundry } from 'viem/chains'
   *
   * const client = createTestClient({
   *   mode: 'anvil',
   *   chain: 'foundry',
   *   transport: http(),
   * })
   * await client.setBalance({
   *   address: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
   *   value: parseEther('1'),
   * })
   */
  setBalance: (args: SetBalanceParameters) => Promise<void>
  /**
   * Sets the block's gas limit.
   *
   * - Docs: https://viem.sh/docs/actions/test/setBlockGasLimit.html
   *
   * @param parameters – {@link SetBlockGasLimitParameters}
   *
   * @example
   * import { createTestClient, http } from 'viem'
   * import { foundry } from 'viem/chains'
   *
   * const client = createTestClient({
   *   mode: 'anvil',
   *   chain: 'foundry',
   *   transport: http(),
   * })
   * await client.setBlockGasLimit({ gasLimit: 420_000n })
   */
  setBlockGasLimit: (args: SetBlockGasLimitParameters) => Promise<void>
  /**
   * Similar to [`increaseTime`](https://viem.sh/docs/actions/test/increaseTime), but sets a block timestamp `interval`. The timestamp of future blocks will be computed as `lastBlock_timestamp` + `interval`.
   *
   * - Docs: https://viem.sh/docs/actions/test/setBlockTimestampInterval.html
   *
   * @param parameters – {@link SetBlockTimestampIntervalParameters}
   *
   * @example
   * import { createTestClient, http } from 'viem'
   * import { foundry } from 'viem/chains'
   *
   * const client = createTestClient({
   *   mode: 'anvil',
   *   chain: 'foundry',
   *   transport: http(),
   * })
   * await client.setBlockTimestampInterval({ interval: 5 })
   */
  setBlockTimestampInterval: (
    args: SetBlockTimestampIntervalParameters,
  ) => Promise<void>
  setCode: (args: SetCodeParameters) => Promise<void>
  setCoinbase: (args: SetCoinbaseParameters) => Promise<void>
  setIntervalMining: (args: SetIntervalMiningParameters) => Promise<void>
  setLoggingEnabled: (args: boolean) => Promise<void>
  setMinGasPrice: (args: SetMinGasPriceParameters) => Promise<void>
  setNextBlockBaseFeePerGas: (
    args: SetNextBlockBaseFeePerGasParameters,
  ) => Promise<void>
  setNextBlockTimestamp: (
    args: SetNextBlockTimestampParameters,
  ) => Promise<void>
  setNonce: (args: SetNonceParameters) => Promise<void>
  setRpcUrl: (args: string) => Promise<void>
  setStorageAt: (args: SetStorageAtParameters) => Promise<void>
  snapshot: () => Promise<Quantity>
  stopImpersonatingAccount: (
    args: StopImpersonatingAccountParameters,
  ) => Promise<void>
}

export function testActions<TChain extends Chain | undefined>(
  client: TestClient<TestClientMode, Transport, TChain>,
): TestActions {
  return {
    dropTransaction: (args) => dropTransaction(client, args),
    getAutomine: () => getAutomine(client),
    getTxpoolContent: () => getTxpoolContent(client),
    getTxpoolStatus: () => getTxpoolStatus(client),
    impersonateAccount: (args) => impersonateAccount(client, args),
    increaseTime: (args) => increaseTime(client, args),
    inspectTxpool: () => inspectTxpool(client),
    mine: (args) => mine(client, args),
    removeBlockTimestampInterval: () => removeBlockTimestampInterval(client),
    reset: (args) => reset(client, args),
    revert: (args) => revert(client, args),
    sendUnsignedTransaction: (args) => sendUnsignedTransaction(client, args),
    setAutomine: (args) => setAutomine(client, args),
    setBalance: (args) => setBalance(client, args),
    setBlockGasLimit: (args) => setBlockGasLimit(client, args),
    setBlockTimestampInterval: (args) =>
      setBlockTimestampInterval(client, args),
    setCode: (args) => setCode(client, args),
    setCoinbase: (args) => setCoinbase(client, args),
    setIntervalMining: (args) => setIntervalMining(client, args),
    setLoggingEnabled: (args) => setLoggingEnabled(client, args),
    setMinGasPrice: (args) => setMinGasPrice(client, args),
    setNextBlockBaseFeePerGas: (args) =>
      setNextBlockBaseFeePerGas(client, args),
    setNextBlockTimestamp: (args) => setNextBlockTimestamp(client, args),
    setNonce: (args) => setNonce(client, args),
    setRpcUrl: (args) => setRpcUrl(client, args),
    setStorageAt: (args) => setStorageAt(client, args),
    snapshot: () => snapshot(client),
    stopImpersonatingAccount: (args) => stopImpersonatingAccount(client, args),
  }
}
