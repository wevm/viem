export { fetchBalance, requestAccounts } from './account'
export type { FetchBalanceArgs, FetchBalanceResponse } from './account'

export {
  fetchBlock,
  fetchBlockNumber,
  watchBlockNumber,
  watchBlocks,
} from './block'
export type {
  FetchBlockArgs,
  FetchBlockNumberResponse,
  FetchBlockResponse,
  OnBlock,
  OnBlockNumber,
  OnBlockNumberResponse,
  OnBlockResponse,
  WatchBlockNumberArgs,
  WatchBlocksArgs,
} from './block'

export { mine, setBalance } from './test'
export type { MineArgs, SetBalanceArgs } from './test'

export {
  fetchTransaction,
  fetchTransactionReceipt,
  sendTransaction,
} from './transaction'
export type {
  FetchTransactionArgs,
  FetchTransactionResponse,
  FetchTransactionReceiptArgs,
  FetchTransactionReceiptResponse,
  SendTransactionArgs,
  SendTransactionResponse,
} from './transaction'
