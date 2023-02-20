import type {
  DropTransactionArgs,
  GetAutomineResponse,
  GetTxPoolContentResponse,
  GetTxPoolStatusResponse,
  ImpersonateAccountArgs,
  IncreaseTimeArgs,
  InspectTxpoolResponse,
  MineArgs,
  ResetArgs,
  RevertArgs,
  SendUnsignedTransactionArgs,
  SendUnsignedTransactionResponse,
  SetBalanceArgs,
  SetBlockGasLimitArgs,
  SetBlockTimestampIntervalArgs,
  SetCodeArgs,
  SetCoinbaseArgs,
  SetIntervalMiningArgs,
  SetMinGasPriceArgs,
  SetNextBlockBaseFeePerGasArgs,
  SetNextBlockTimestampArgs,
  SetNonceArgs,
  SetStorageAtArgs,
  StopImpersonatingAccountArgs,
} from '../../actions/test'
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
} from '../../actions/test'
import { Chain, Quantity } from '../../types'
import type { TestClient } from '../createTestClient'

export type TestActions<TChain extends Chain = Chain> = {
  dropTransaction: (args: DropTransactionArgs) => Promise<void>
  getAutomine: () => Promise<GetAutomineResponse>
  getTxPoolContent: () => Promise<GetTxPoolContentResponse>
  getTxPoolStatus: () => Promise<GetTxPoolStatusResponse>
  impersonateAccount: (args: ImpersonateAccountArgs) => Promise<void>
  increaseTime: (args: IncreaseTimeArgs) => Promise<Quantity>
  inspectTxpool: () => Promise<InspectTxpoolResponse>
  mine: (args: MineArgs) => Promise<void>
  removeBlockTimestampInterval: () => Promise<void>
  reset: (args: ResetArgs) => Promise<void>
  revert: (args: RevertArgs) => Promise<void>
  sendUnsignedTransaction: (
    args: SendUnsignedTransactionArgs,
  ) => Promise<SendUnsignedTransactionResponse>
  setAutomine: (args: boolean) => Promise<void>
  setBalance: (args: SetBalanceArgs) => Promise<void>
  setBlockGasLimit: (args: SetBlockGasLimitArgs) => Promise<void>
  setBlockTimestampInterval: (
    args: SetBlockTimestampIntervalArgs,
  ) => Promise<void>
  setCode: (args: SetCodeArgs) => Promise<void>
  setCoinbase: (args: SetCoinbaseArgs) => Promise<void>
  setIntervalMining: (args: SetIntervalMiningArgs) => Promise<void>
  setLoggingEnabled: (args: boolean) => Promise<void>
  setMinGasPrice: (args: SetMinGasPriceArgs) => Promise<void>
  setNextBlockBaseFeePerGas: (
    args: SetNextBlockBaseFeePerGasArgs,
  ) => Promise<void>
  setNextBlockTimestamp: (args: SetNextBlockTimestampArgs) => Promise<void>
  setNonce: (args: SetNonceArgs) => Promise<void>
  setRpcUrl: (args: string) => Promise<void>
  setStorageAt: (args: SetStorageAtArgs) => Promise<void>
  snapshot: () => Promise<Quantity>
  stopImpersonatingAccount: (
    args: StopImpersonatingAccountArgs,
  ) => Promise<void>
}

export const testActions = <
  TChain extends Chain,
  TClient extends TestClient<any, any>,
>(
  client: TClient,
): TestActions<TChain> => ({
  dropTransaction: (args) => dropTransaction(client, args),
  getAutomine: () => getAutomine(client),
  getTxPoolContent: () => getTxpoolContent(client),
  getTxPoolStatus: () => getTxpoolStatus(client),
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
  setBlockTimestampInterval: (args) => setBlockTimestampInterval(client, args),
  setCode: (args) => setCode(client, args),
  setCoinbase: (args) => setCoinbase(client, args),
  setIntervalMining: (args) => setIntervalMining(client, args),
  setLoggingEnabled: (args) => setLoggingEnabled(client, args),
  setMinGasPrice: (args) => setMinGasPrice(client, args),
  setNextBlockBaseFeePerGas: (args) => setNextBlockBaseFeePerGas(client, args),
  setNextBlockTimestamp: (args) => setNextBlockTimestamp(client, args),
  setNonce: (args) => setNonce(client, args),
  setRpcUrl: (args) => setRpcUrl(client, args),
  setStorageAt: (args) => setStorageAt(client, args),
  snapshot: () => snapshot(client),
  stopImpersonatingAccount: (args) => stopImpersonatingAccount(client, args),
})
