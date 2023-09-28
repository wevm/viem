// TODO(v2): Remove this entrypoint. Favor importing from actions entrypoint (`viem/actions`).

export {
  call,
  type CallErrorType,
  type CallParameters,
  type CallReturnType,
} from '../actions/public/call.js'
export {
  createBlockFilter,
  type CreateBlockFilterErrorType,
  type CreateBlockFilterReturnType,
} from '../actions/public/createBlockFilter.js'
export {
  createEventFilter,
  type CreateEventFilterErrorType,
  type CreateEventFilterParameters,
  type CreateEventFilterReturnType,
} from '../actions/public/createEventFilter.js'
export {
  createPendingTransactionFilter,
  type CreatePendingTransactionFilterErrorType,
  type CreatePendingTransactionFilterReturnType,
} from '../actions/public/createPendingTransactionFilter.js'
export {
  estimateGas,
  type EstimateGasErrorType,
  type EstimateGasParameters,
  type EstimateGasReturnType,
} from '../actions/public/estimateGas.js'
export {
  getBalance,
  type GetBalanceErrorType,
  type GetBalanceParameters,
  type GetBalanceReturnType,
} from '../actions/public/getBalance.js'
export {
  getBlock,
  type GetBlockErrorType,
  type GetBlockParameters,
  type GetBlockReturnType,
} from '../actions/public/getBlock.js'
export {
  getBlockNumber,
  getBlockNumberCache,
  type GetBlockNumberErrorType,
  type GetBlockNumberParameters,
  type GetBlockNumberReturnType,
} from '../actions/public/getBlockNumber.js'
export {
  getBlockTransactionCount,
  type GetBlockTransactionCountErrorType,
  type GetBlockTransactionCountParameters,
  type GetBlockTransactionCountReturnType,
} from '../actions/public/getBlockTransactionCount.js'
export {
  getBytecode,
  type GetBytecodeErrorType,
  type GetBytecodeParameters,
  type GetBytecodeReturnType,
} from '../actions/public/getBytecode.js'
export { getChainId } from '../actions/public/getChainId.js'
export {
  getFeeHistory,
  type GetFeeHistoryErrorType,
  type GetFeeHistoryParameters,
  type GetFeeHistoryReturnType,
} from '../actions/public/getFeeHistory.js'
export {
  estimateFeesPerGas,
  type EstimateFeesPerGasErrorType,
  type EstimateFeesPerGasParameters,
  type EstimateFeesPerGasReturnType,
} from '../actions/public/estimateFeesPerGas.js'
export {
  getFilterChanges,
  type GetFilterChangesErrorType,
  type GetFilterChangesParameters,
  type GetFilterChangesReturnType,
} from '../actions/public/getFilterChanges.js'
export {
  getFilterLogs,
  type GetFilterLogsErrorType,
  type GetFilterLogsParameters,
  type GetFilterLogsReturnType,
} from '../actions/public/getFilterLogs.js'
export {
  getLogs,
  type GetLogsErrorType,
  type GetLogsParameters,
  type GetLogsReturnType,
} from '../actions/public/getLogs.js'
export {
  getGasPrice,
  type GetGasPriceErrorType,
  type GetGasPriceReturnType,
} from '../actions/public/getGasPrice.js'
export {
  estimateMaxPriorityFeePerGas,
  type EstimateMaxPriorityFeePerGasErrorType,
  type EstimateMaxPriorityFeePerGasParameters,
  type EstimateMaxPriorityFeePerGasReturnType,
} from '../actions/public/estimateMaxPriorityFeePerGas.js'
export {
  getTransaction,
  type GetTransactionErrorType,
  type GetTransactionParameters,
  type GetTransactionReturnType,
} from '../actions/public/getTransaction.js'
export {
  getTransactionConfirmations,
  type GetTransactionConfirmationsErrorType,
  type GetTransactionConfirmationsParameters,
  type GetTransactionConfirmationsReturnType,
} from '../actions/public/getTransactionConfirmations.js'
export {
  getTransactionCount,
  type GetTransactionCountErrorType,
  type GetTransactionCountParameters,
  type GetTransactionCountReturnType,
} from '../actions/public/getTransactionCount.js'
export {
  getTransactionReceipt,
  type GetTransactionReceiptErrorType,
  type GetTransactionReceiptParameters,
  type GetTransactionReceiptReturnType,
} from '../actions/public/getTransactionReceipt.js'
export {
  uninstallFilter,
  type UninstallFilterErrorType,
  type UninstallFilterParameters,
  type UninstallFilterReturnType,
} from '../actions/public/uninstallFilter.js'
export {
  waitForTransactionReceipt,
  type ReplacementReason,
  type ReplacementReturnType,
  type WaitForTransactionReceiptErrorType,
  type WaitForTransactionReceiptParameters,
  type WaitForTransactionReceiptReturnType,
} from '../actions/public/waitForTransactionReceipt.js'
export {
  watchBlockNumber,
  type OnBlockNumberFn,
  type OnBlockNumberParameter,
  type WatchBlockNumberErrorType,
  type WatchBlockNumberReturnType,
  type WatchBlockNumberParameters,
} from '../actions/public/watchBlockNumber.js'
export {
  watchBlocks,
  type OnBlock,
  type OnBlockParameter,
  type WatchBlocksErrorType,
  type WatchBlocksParameters,
} from '../actions/public/watchBlocks.js'
export {
  watchEvent,
  type WatchEventErrorType,
  type WatchEventOnLogsFn,
  /** @deprecated - use `WatchEventOnLogsFn` instead. */
  type WatchEventOnLogsFn as OnLogsFn,
  type WatchEventOnLogsParameter,
  /** @deprecated - use `WatchEventOnLogsParameter` instead. */
  type WatchEventOnLogsParameter as OnLogsParameter,
} from '../actions/public/watchEvent.js'
export {
  watchPendingTransactions,
  type OnTransactionsFn,
  type OnTransactionsParameter,
  type WatchPendingTransactionsErrorType,
  type WatchPendingTransactionsReturnType,
  type WatchPendingTransactionsParameters,
} from '../actions/public/watchPendingTransactions.js'
