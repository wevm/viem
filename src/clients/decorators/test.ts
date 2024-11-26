import {
  type DropTransactionParameters,
  dropTransaction,
} from '../../actions/test/dropTransaction.js'
import {
  type DumpStateReturnType,
  dumpState,
} from '../../actions/test/dumpState.js'
import {
  type GetAutomineReturnType,
  getAutomine,
} from '../../actions/test/getAutomine.js'
import {
  type GetTxpoolContentReturnType,
  getTxpoolContent,
} from '../../actions/test/getTxpoolContent.js'
import {
  type GetTxpoolStatusReturnType,
  getTxpoolStatus,
} from '../../actions/test/getTxpoolStatus.js'
import {
  type ImpersonateAccountParameters,
  impersonateAccount,
} from '../../actions/test/impersonateAccount.js'
import {
  type IncreaseTimeParameters,
  increaseTime,
} from '../../actions/test/increaseTime.js'
import {
  type InspectTxpoolReturnType,
  inspectTxpool,
} from '../../actions/test/inspectTxpool.js'
import {
  type LoadStateParameters,
  type LoadStateReturnType,
  loadState,
} from '../../actions/test/loadState.js'
import { type MineParameters, mine } from '../../actions/test/mine.js'
import { removeBlockTimestampInterval } from '../../actions/test/removeBlockTimestampInterval.js'
import { type ResetParameters, reset } from '../../actions/test/reset.js'
import { type RevertParameters, revert } from '../../actions/test/revert.js'
import {
  type SendUnsignedTransactionParameters,
  type SendUnsignedTransactionReturnType,
  sendUnsignedTransaction,
} from '../../actions/test/sendUnsignedTransaction.js'
import { setAutomine } from '../../actions/test/setAutomine.js'
import {
  type SetBalanceParameters,
  setBalance,
} from '../../actions/test/setBalance.js'
import {
  type SetBlockGasLimitParameters,
  setBlockGasLimit,
} from '../../actions/test/setBlockGasLimit.js'
import {
  type SetBlockTimestampIntervalParameters,
  setBlockTimestampInterval,
} from '../../actions/test/setBlockTimestampInterval.js'
import { type SetCodeParameters, setCode } from '../../actions/test/setCode.js'
import {
  type SetCoinbaseParameters,
  setCoinbase,
} from '../../actions/test/setCoinbase.js'
import {
  type SetIntervalMiningParameters,
  setIntervalMining,
} from '../../actions/test/setIntervalMining.js'
import { setLoggingEnabled } from '../../actions/test/setLoggingEnabled.js'
import {
  type SetMinGasPriceParameters,
  setMinGasPrice,
} from '../../actions/test/setMinGasPrice.js'
import {
  type SetNextBlockBaseFeePerGasParameters,
  setNextBlockBaseFeePerGas,
} from '../../actions/test/setNextBlockBaseFeePerGas.js'
import {
  type SetNextBlockTimestampParameters,
  setNextBlockTimestamp,
} from '../../actions/test/setNextBlockTimestamp.js'
import {
  type SetNonceParameters,
  setNonce,
} from '../../actions/test/setNonce.js'
import { setRpcUrl } from '../../actions/test/setRpcUrl.js'
import {
  type SetStorageAtParameters,
  setStorageAt,
} from '../../actions/test/setStorageAt.js'
import { snapshot } from '../../actions/test/snapshot.js'
import {
  type StopImpersonatingAccountParameters,
  stopImpersonatingAccount,
} from '../../actions/test/stopImpersonatingAccount.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { Quantity } from '../../types/rpc.js'
import type { Client } from '../createClient.js'
import type { TestClientMode } from '../createTestClient.js'
import type { Transport } from '../transports/createTransport.js'

export type TestActions = {
  /**
   * Removes a transaction from the mempool.
   *
   * - Docs: https://viem.sh/docs/actions/test/dropTransaction
   *
   * @param args - {@link DropTransactionParameters}
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
   * Serializes the current state (including contracts code, contract's storage,
   * accounts properties, etc.) into a savable data blob.
   *
   * - Docs: https://viem.sh/docs/actions/test/dumpState
   *
   * @param client - Client to use
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
   * await client.dumpState()
   */
  dumpState: () => Promise<DumpStateReturnType>
  /**
   * Returns the automatic mining status of the node.
   *
   * - Docs: https://viem.sh/docs/actions/test/getAutomine
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
   * - Docs: https://viem.sh/docs/actions/test/getTxpoolContent
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
   * - Docs: https://viem.sh/docs/actions/test/getTxpoolStatus
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
   * - Docs: https://viem.sh/docs/actions/test/impersonateAccount
   *
   * @param args - {@link ImpersonateAccountParameters}
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
   * - Docs: https://viem.sh/docs/actions/test/increaseTime
   *
   * @param args – {@link IncreaseTimeParameters}
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
   * - Docs: https://viem.sh/docs/actions/test/inspectTxpool
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
   * Adds state previously dumped with `dumpState` to the current chain.
   *
   * - Docs: https://viem.sh/docs/actions/test/loadState
   *
   * @param client - Client to use
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
   * await client.loadState({ state: '0x...' })
   */
  loadState: (args: LoadStateParameters) => Promise<LoadStateReturnType>
  /**
   * Mine a specified number of blocks.
   *
   * - Docs: https://viem.sh/docs/actions/test/mine
   *
   * @param client - Client to use
   * @param args – {@link MineParameters}
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
   * Removes [`setBlockTimestampInterval`](https://viem.sh/docs/actions/test/setBlockTimestampInterval) if it exists.
   *
   * - Docs: https://viem.sh/docs/actions/test/removeBlockTimestampInterval
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
   * - Docs: https://viem.sh/docs/actions/test/reset
   *
   * @param args – {@link ResetParameters}
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
  reset: (args?: ResetParameters | undefined) => Promise<void>
  /**
   * Revert the state of the blockchain at the current block.
   *
   * - Docs: https://viem.sh/docs/actions/test/revert
   *
   * @param args – {@link RevertParameters}
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
   * - Docs: https://viem.sh/docs/actions/test/getTxpoolContent
   *
   * @param args – {@link SendUnsignedTransactionParameters}
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
  sendUnsignedTransaction: <chain extends Chain | undefined>(
    args: SendUnsignedTransactionParameters<chain>,
  ) => Promise<SendUnsignedTransactionReturnType>
  /**
   * Enables or disables the automatic mining of new blocks with each new transaction submitted to the network.
   *
   * - Docs: https://viem.sh/docs/actions/test/setAutomine
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
   * - Docs: https://viem.sh/docs/actions/test/setBalance
   *
   * @param args – {@link SetBalanceParameters}
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
   * - Docs: https://viem.sh/docs/actions/test/setBlockGasLimit
   *
   * @param args – {@link SetBlockGasLimitParameters}
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
   * - Docs: https://viem.sh/docs/actions/test/setBlockTimestampInterval
   *
   * @param args – {@link SetBlockTimestampIntervalParameters}
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
  /**
   * Modifies the bytecode stored at an account's address.
   *
   * - Docs: https://viem.sh/docs/actions/test/setCode
   *
   * @param args – {@link SetCodeParameters}
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
   * await client.setCode({
   *   address: '0xe846c6fcf817734ca4527b28ccb4aea2b6663c79',
   *   bytecode: '0x60806040526000600355600019600955600c80546001600160a01b031916737a250d5630b4cf539739df…',
   * })
   */
  setCode: (args: SetCodeParameters) => Promise<void>
  /**
   * Sets the coinbase address to be used in new blocks.
   *
   * - Docs: https://viem.sh/docs/actions/test/setCoinbase
   *
   * @param args – {@link SetCoinbaseParameters}
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
   * await client.setCoinbase({
   *   address: '0xe846c6fcf817734ca4527b28ccb4aea2b6663c79',
   * })
   */
  setCoinbase: (args: SetCoinbaseParameters) => Promise<void>
  /**
   * Sets the automatic mining interval (in seconds) of blocks. Setting the interval to 0 will disable automatic mining.
   *
   * - Docs: https://viem.sh/docs/actions/test/setIntervalMining
   *
   * @param args – {@link SetIntervalMiningParameters}
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
   * await client.setIntervalMining({ interval: 5 })
   */
  setIntervalMining: (args: SetIntervalMiningParameters) => Promise<void>
  /**
   * Enable or disable logging on the test node network.
   *
   * - Docs: https://viem.sh/docs/actions/test/setLoggingEnabled
   *
   * @param client - Client to use
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
   * await client.setLoggingEnabled()
   */
  setLoggingEnabled: (args: boolean) => Promise<void>
  /**
   * Change the minimum gas price accepted by the network (in wei).
   *
   * - Docs: https://viem.sh/docs/actions/test/setMinGasPrice
   *
   * Note: `setMinGasPrice` can only be used on clients that do not have EIP-1559 enabled.
   *
   * @param args – {@link SetBlockGasLimitParameters}
   *
   * @example
   * import { createTestClient, http, parseGwei } from 'viem'
   * import { foundry } from 'viem/chains'
   *
   * const client = createTestClient({
   *   mode: 'anvil',
   *   chain: 'foundry',
   *   transport: http(),
   * })
   * await client.setMinGasPrice({
   *   gasPrice: parseGwei('20'),
   * })
   */
  setMinGasPrice: (args: SetMinGasPriceParameters) => Promise<void>
  /**
   * Sets the next block's base fee per gas.
   *
   * - Docs: https://viem.sh/docs/actions/test/setNextBlockBaseFeePerGas
   *
   * @param args – {@link SetNextBlockBaseFeePerGasParameters}
   *
   * @example
   * import { createTestClient, http, parseGwei } from 'viem'
   * import { foundry } from 'viem/chains'
   *
   * const client = createTestClient({
   *   mode: 'anvil',
   *   chain: 'foundry',
   *   transport: http(),
   * })
   * await client.setNextBlockBaseFeePerGas({
   *   baseFeePerGas: parseGwei('20'),
   * })
   */
  setNextBlockBaseFeePerGas: (
    args: SetNextBlockBaseFeePerGasParameters,
  ) => Promise<void>
  /**
   * Sets the next block's timestamp.
   *
   * - Docs: https://viem.sh/docs/actions/test/setNextBlockTimestamp
   *
   * @param args – {@link SetNextBlockTimestampParameters}
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
   * await client.setNextBlockTimestamp({ timestamp: 1671744314n })
   */
  setNextBlockTimestamp: (
    args: SetNextBlockTimestampParameters,
  ) => Promise<void>
  /**
   * Modifies (overrides) the nonce of an account.
   *
   * - Docs: https://viem.sh/docs/actions/test/setNonce
   *
   * @param args – {@link SetNonceParameters}
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
   * await client.setNonce({
   *   address: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
   *   nonce: 420,
   * })
   */
  setNonce: (args: SetNonceParameters) => Promise<void>
  /**
   * Sets the backend RPC URL.
   *
   * - Docs: https://viem.sh/docs/actions/test/setRpcUrl
   *
   * @param jsonRpcUrl – RPC URL
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
   * await client.setRpcUrl('https://eth-mainnet.g.alchemy.com/v2')
   */
  setRpcUrl: (args: string) => Promise<void>
  /**
   * Writes to a slot of an account's storage.
   *
   * - Docs: https://viem.sh/docs/actions/test/setStorageAt
   *
   * @param args – {@link SetStorageAtParameters}
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
   * await client.setStorageAt({
   *   address: '0xe846c6fcf817734ca4527b28ccb4aea2b6663c79',
   *   index: 2,
   *   value: '0x0000000000000000000000000000000000000000000000000000000000000069',
   * })
   */
  setStorageAt: (args: SetStorageAtParameters) => Promise<void>
  /**
   * Snapshot the state of the blockchain at the current block.
   *
   * - Docs: https://viem.sh/docs/actions/test/snapshot
   *
   * @example
   * import { createTestClient, http } from 'viem'
   * import { foundry } from 'viem/chains'
   * import { snapshot } from 'viem/test'
   *
   * const client = createTestClient({
   *   mode: 'anvil',
   *   chain: 'foundry',
   *   transport: http(),
   * })
   * await client.snapshot()
   */
  snapshot: () => Promise<Quantity>
  /**
   * Stop impersonating an account after having previously used [`impersonateAccount`](https://viem.sh/docs/actions/test/impersonateAccount).
   *
   * - Docs: https://viem.sh/docs/actions/test/stopImpersonatingAccount
   *
   * @param args – {@link StopImpersonatingAccountParameters}
   *
   * @example
   * import { createTestClient, http } from 'viem'
   * import { foundry } from 'viem/chains'
   * import { stopImpersonatingAccount } from 'viem/test'
   *
   * const client = createTestClient({
   *   mode: 'anvil',
   *   chain: 'foundry',
   *   transport: http(),
   * })
   * await client.stopImpersonatingAccount({
   *   address: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
   * })
   */
  stopImpersonatingAccount: (
    args: StopImpersonatingAccountParameters,
  ) => Promise<void>
}

export function testActions<mode extends TestClientMode>({
  mode,
}: { mode: mode }): <
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
>(
  client: Client<transport, chain, account>,
) => TestActions {
  return <
    transport extends Transport = Transport,
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  >(
    client_: Client<transport, chain, account>,
  ): TestActions => {
    const client = client_.extend(() => ({
      mode,
    }))
    return {
      dropTransaction: (args) => dropTransaction(client, args),
      dumpState: () => dumpState(client),
      getAutomine: () => getAutomine(client),
      getTxpoolContent: () => getTxpoolContent(client),
      getTxpoolStatus: () => getTxpoolStatus(client),
      impersonateAccount: (args) => impersonateAccount(client, args),
      increaseTime: (args) => increaseTime(client, args),
      inspectTxpool: () => inspectTxpool(client),
      loadState: (args) => loadState(client, args),
      mine: (args) => mine(client, args),
      removeBlockTimestampInterval: () => removeBlockTimestampInterval(client),
      reset: (args) => reset(client, args),
      revert: (args) => revert(client, args),
      sendUnsignedTransaction: (args) =>
        sendUnsignedTransaction(client, args as any),
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
      stopImpersonatingAccount: (args) =>
        stopImpersonatingAccount(client, args),
    }
  }
}
