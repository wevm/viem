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
  dropTransaction: (args: DropTransactionParameters) => Promise<void>
  getAutomine: () => Promise<GetAutomineReturnType>
  getTxpoolContent: () => Promise<GetTxpoolContentReturnType>
  getTxpoolStatus: () => Promise<GetTxpoolStatusReturnType>
  impersonateAccount: (args: ImpersonateAccountParameters) => Promise<void>
  increaseTime: (args: IncreaseTimeParameters) => Promise<Quantity>
  inspectTxpool: () => Promise<InspectTxpoolReturnType>
  mine: (args: MineParameters) => Promise<void>
  removeBlockTimestampInterval: () => Promise<void>
  reset: (args?: ResetParameters) => Promise<void>
  revert: (args: RevertParameters) => Promise<void>
  sendUnsignedTransaction: (
    args: SendUnsignedTransactionParameters,
  ) => Promise<SendUnsignedTransactionReturnType>
  setAutomine: (args: boolean) => Promise<void>
  setBalance: (args: SetBalanceParameters) => Promise<void>
  setBlockGasLimit: (args: SetBlockGasLimitParameters) => Promise<void>
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
