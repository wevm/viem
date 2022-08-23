export { fetchBalance, requestAccountAddresses } from './account'
export type { FetchBalanceArgs, FetchBalanceResponse } from './account'

export { fetchBlock, fetchBlockNumber, watchBlocks } from './block'
export type {
  FetchBlockArgs,
  FetchBlockNumberResponse,
  FetchBlockResponse,
  WatchBlocksArgs,
  WatchBlocksCallback,
  WatchBlocksResponse,
} from './block'

export { mine, setBalance } from './test'
export type { MineArgs, SetBalanceArgs } from './test'

export { fetchTransaction, sendTransaction } from './transaction'
export type {
  FetchTransactionArgs,
  FetchTransactionResponse,
  SendTransactionArgs,
  SendTransactionResponse,
} from './transaction'
