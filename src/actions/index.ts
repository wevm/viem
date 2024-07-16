// biome-ignore lint/performance/noBarrelFile: entrypoint module
export {
  type AddChainErrorType,
  type AddChainParameters,
  addChain,
} from './wallet/addChain.js'
export {
  type DeployContractErrorType,
  type DeployContractParameters,
  type DeployContractReturnType,
  deployContract,
} from './wallet/deployContract.js'
export {
  type GetEnsAddressErrorType,
  type GetEnsAddressParameters,
  type GetEnsAddressReturnType,
  getEnsAddress,
} from './ens/getEnsAddress.js'
export {
  type GetEnsAvatarErrorType,
  type GetEnsAvatarParameters,
  type GetEnsAvatarReturnType,
  getEnsAvatar,
} from './ens/getEnsAvatar.js'
export {
  type GetEnsNameErrorType,
  type GetEnsNameParameters,
  type GetEnsNameReturnType,
  getEnsName,
} from './ens/getEnsName.js'
export {
  type GetEnsResolverErrorType,
  type GetEnsResolverParameters,
  type GetEnsResolverReturnType,
  getEnsResolver,
} from './ens/getEnsResolver.js'
export {
  type GetEnsTextErrorType,
  type GetEnsTextParameters,
  type GetEnsTextReturnType,
  getEnsText,
} from './ens/getEnsText.js'
export {
  type CallErrorType,
  type CallParameters,
  type CallReturnType,
  call,
} from './public/call.js'
export {
  type CreateBlockFilterErrorType,
  type CreateBlockFilterReturnType,
  createBlockFilter,
} from './public/createBlockFilter.js'
export {
  type CreateContractEventFilterErrorType,
  type CreateContractEventFilterParameters,
  type CreateContractEventFilterReturnType,
  createContractEventFilter,
} from './public/createContractEventFilter.js'
export {
  type CreateEventFilterErrorType,
  type CreateEventFilterParameters,
  type CreateEventFilterReturnType,
  createEventFilter,
} from './public/createEventFilter.js'
export {
  type CreatePendingTransactionFilterErrorType,
  type CreatePendingTransactionFilterReturnType,
  createPendingTransactionFilter,
} from './public/createPendingTransactionFilter.js'
export {
  type DumpStateErrorType,
  type DumpStateReturnType,
  dumpState,
} from './test/dumpState.js'
export {
  type EstimateContractGasErrorType,
  type EstimateContractGasParameters,
  type EstimateContractGasReturnType,
  estimateContractGas,
} from './public/estimateContractGas.js'
export {
  type EstimateFeesPerGasErrorType,
  type EstimateFeesPerGasParameters,
  type EstimateFeesPerGasReturnType,
  estimateFeesPerGas,
} from './public/estimateFeesPerGas.js'
export {
  type EstimateMaxPriorityFeePerGasErrorType,
  type EstimateMaxPriorityFeePerGasParameters,
  type EstimateMaxPriorityFeePerGasReturnType,
  estimateMaxPriorityFeePerGas,
} from './public/estimateMaxPriorityFeePerGas.js'
export {
  type EstimateGasErrorType,
  type EstimateGasParameters,
  type EstimateGasReturnType,
  estimateGas,
} from './public/estimateGas.js'
export {
  type GetBalanceErrorType,
  type GetBalanceParameters,
  type GetBalanceReturnType,
  getBalance,
} from './public/getBalance.js'
export {
  type GetBlobBaseFeeErrorType,
  type GetBlobBaseFeeReturnType,
  getBlobBaseFee,
} from './public/getBlobBaseFee.js'
export {
  type GetBlockErrorType,
  type GetBlockParameters,
  type GetBlockReturnType,
  getBlock,
} from './public/getBlock.js'
export {
  type GetBlockNumberErrorType,
  type GetBlockNumberParameters,
  type GetBlockNumberReturnType,
  getBlockNumber,
} from './public/getBlockNumber.js'
export {
  type GetBlockTransactionCountErrorType,
  type GetBlockTransactionCountParameters,
  type GetBlockTransactionCountReturnType,
  getBlockTransactionCount,
} from './public/getBlockTransactionCount.js'
export {
  type GetChainIdErrorType,
  type GetChainIdReturnType,
  getChainId,
} from './public/getChainId.js'
export {
  /** @deprecated Use `GetCodeErrorType` instead */
  type GetCodeErrorType as GetBytecodeErrorType,
  /** @deprecated Use `GetCodeParameters` instead */
  type GetCodeParameters as GetBytecodeParameters,
  /** @deprecated Use `GetCodeReturnType` instead  */
  type GetCodeReturnType as GetBytecodeReturnType,
  /** @deprecated Use `getCode` instead  */
  getCode as getBytecode,
  type GetCodeErrorType,
  type GetCodeParameters,
  type GetCodeReturnType,
  getCode,
} from './public/getCode.js'
export {
  type GetContractEventsErrorType,
  type GetContractEventsParameters,
  type GetContractEventsReturnType,
  getContractEvents,
} from './public/getContractEvents.js'
export {
  type GetEip712DomainErrorType,
  type GetEip712DomainParameters,
  type GetEip712DomainReturnType,
  getEip712Domain,
} from './public/getEip712Domain.js'
export {
  type GetFeeHistoryErrorType,
  type GetFeeHistoryParameters,
  type GetFeeHistoryReturnType,
  getFeeHistory,
} from './public/getFeeHistory.js'
export {
  type GetFilterChangesErrorType,
  type GetFilterChangesParameters,
  type GetFilterChangesReturnType,
  getFilterChanges,
} from './public/getFilterChanges.js'
export {
  type GetFilterLogsErrorType,
  type GetFilterLogsParameters,
  type GetFilterLogsReturnType,
  getFilterLogs,
} from './public/getFilterLogs.js'
export {
  type GetGasPriceErrorType,
  type GetGasPriceReturnType,
  getGasPrice,
} from './public/getGasPrice.js'
export {
  type GetLogsErrorType,
  type GetLogsParameters,
  type GetLogsReturnType,
  getLogs,
} from './public/getLogs.js'
export {
  type GetStorageAtErrorType,
  type GetStorageAtParameters,
  type GetStorageAtReturnType,
  getStorageAt,
} from './public/getStorageAt.js'
export {
  type GetTransactionConfirmationsErrorType,
  type GetTransactionConfirmationsParameters,
  type GetTransactionConfirmationsReturnType,
  getTransactionConfirmations,
} from './public/getTransactionConfirmations.js'
export {
  type GetTransactionCountErrorType,
  type GetTransactionCountParameters,
  type GetTransactionCountReturnType,
  getTransactionCount,
} from './public/getTransactionCount.js'
export {
  type GetTransactionErrorType,
  type GetTransactionParameters,
  type GetTransactionReturnType,
  getTransaction,
} from './public/getTransaction.js'
export {
  type GetTransactionReceiptErrorType,
  type GetTransactionReceiptParameters,
  type GetTransactionReceiptReturnType,
  getTransactionReceipt,
} from './public/getTransactionReceipt.js'
export {
  type ImpersonateAccountErrorType,
  type ImpersonateAccountParameters,
  impersonateAccount,
} from './test/impersonateAccount.js'
export {
  type IncreaseTimeErrorType,
  type IncreaseTimeParameters,
  increaseTime,
} from './test/increaseTime.js'
export {
  type LoadStateErrorType,
  type LoadStateParameters,
  type LoadStateReturnType,
  loadState,
} from './test/loadState.js'
export {
  type MineErrorType,
  type MineParameters,
  mine,
} from './test/mine.js'
export {
  type MulticallErrorType,
  type MulticallParameters,
  type MulticallReturnType,
  multicall,
} from './public/multicall.js'
export {
  type OnBlock,
  type OnBlockParameter,
  type WatchBlocksErrorType,
  type WatchBlocksParameters,
  type WatchBlocksReturnType,
  watchBlocks,
} from './public/watchBlocks.js'
export {
  type OnBlockNumberFn,
  type OnBlockNumberParameter,
  type WatchBlockNumberErrorType,
  type WatchBlockNumberParameters,
  type WatchBlockNumberReturnType,
  watchBlockNumber,
} from './public/watchBlockNumber.js'
export {
  type WatchEventOnLogsFn,
  type WatchEventOnLogsParameter,
  type WatchEventParameters,
  type WatchEventReturnType,
  watchEvent,
} from './public/watchEvent.js'
export {
  type OnTransactionsFn,
  type OnTransactionsParameter,
  type WatchPendingTransactionsErrorType,
  type WatchPendingTransactionsParameters,
  type WatchPendingTransactionsReturnType,
  watchPendingTransactions,
} from './public/watchPendingTransactions.js'
export {
  type ReadContractErrorType,
  type ReadContractParameters,
  type ReadContractReturnType,
  readContract,
} from './public/readContract.js'
export {
  type GetAddressesErrorType,
  type GetAddressesReturnType,
  getAddresses,
} from './wallet/getAddresses.js'
export {
  type GetPermissionsErrorType,
  type GetPermissionsReturnType,
  getPermissions,
} from './wallet/getPermissions.js'
export {
  type GetProofErrorType,
  type GetProofParameters,
  type GetProofReturnType,
  getProof,
} from './public/getProof.js'
export {
  type ReplacementReason,
  type ReplacementReturnType,
  type WaitForTransactionReceiptErrorType,
  type WaitForTransactionReceiptParameters,
  type WaitForTransactionReceiptReturnType,
  waitForTransactionReceipt,
} from './public/waitForTransactionReceipt.js'
export {
  type RequestAddressesErrorType,
  type RequestAddressesReturnType,
  requestAddresses,
} from './wallet/requestAddresses.js'
export {
  type RequestPermissionsErrorType,
  type RequestPermissionsReturnType,
  type RequestPermissionsParameters,
  requestPermissions,
} from './wallet/requestPermissions.js'
export {
  type DropTransactionParameters,
  dropTransaction,
} from './test/dropTransaction.js'
export {
  type GetAutomineErrorType,
  type GetAutomineReturnType,
  getAutomine,
} from './test/getAutomine.js'
export {
  type GetTxpoolContentErrorType,
  type GetTxpoolContentReturnType,
  getTxpoolContent,
} from './test/getTxpoolContent.js'
export {
  type GetTxpoolStatusErrorType,
  type GetTxpoolStatusReturnType,
  getTxpoolStatus,
} from './test/getTxpoolStatus.js'
export {
  type InspectTxpoolErrorType,
  type InspectTxpoolReturnType,
  inspectTxpool,
} from './test/inspectTxpool.js'
export {
  type RemoveBlockTimestampIntervalErrorType,
  removeBlockTimestampInterval,
} from './test/removeBlockTimestampInterval.js'
export {
  type ResetErrorType,
  type ResetParameters,
  reset,
} from './test/reset.js'
export {
  type RevertErrorType,
  type RevertParameters,
  revert,
} from './test/revert.js'
export {
  type PrepareTransactionRequestErrorType,
  type PrepareTransactionRequestParameters,
  type PrepareTransactionRequestReturnType,
  prepareTransactionRequest,
  defaultParameters as defaultPrepareTransactionRequestParameters,
} from './wallet/prepareTransactionRequest.js'
export {
  type SendTransactionErrorType,
  type SendTransactionParameters,
  type SendTransactionReturnType,
  sendTransaction,
} from './wallet/sendTransaction.js'
export {
  type SignTransactionErrorType,
  type SignTransactionParameters,
  type SignTransactionReturnType,
  signTransaction,
} from './wallet/signTransaction.js'
export {
  type SendRawTransactionErrorType,
  type SendRawTransactionParameters,
  type SendRawTransactionReturnType,
  sendRawTransaction,
} from './wallet/sendRawTransaction.js'
export {
  type SendUnsignedTransactionErrorType,
  type SendUnsignedTransactionParameters,
  type SendUnsignedTransactionReturnType,
  sendUnsignedTransaction,
} from './test/sendUnsignedTransaction.js'
export {
  type SetBalanceErrorType,
  type SetBalanceParameters,
  setBalance,
} from './test/setBalance.js'
export { type SetAutomineErrorType, setAutomine } from './test/setAutomine.js'
export {
  type SetBlockGasLimitErrorType,
  type SetBlockGasLimitParameters,
  setBlockGasLimit,
} from './test/setBlockGasLimit.js'
export {
  type SetBlockTimestampIntervalErrorType,
  type SetBlockTimestampIntervalParameters,
  setBlockTimestampInterval,
} from './test/setBlockTimestampInterval.js'
export {
  type SetCodeErrorType,
  type SetCodeParameters,
  setCode,
} from './test/setCode.js'
export {
  type SetCoinbaseErrorType,
  type SetCoinbaseParameters,
  setCoinbase,
} from './test/setCoinbase.js'
export {
  type SetIntervalMiningErrorType,
  type SetIntervalMiningParameters,
  setIntervalMining,
} from './test/setIntervalMining.js'
export {
  type SetLoggingEnabledErrorType,
  setLoggingEnabled,
} from './test/setLoggingEnabled.js'
export {
  type SetMinGasPriceErrorType,
  type SetMinGasPriceParameters,
  setMinGasPrice,
} from './test/setMinGasPrice.js'
export {
  type SetNextBlockBaseFeePerGasErrorType,
  type SetNextBlockBaseFeePerGasParameters,
  setNextBlockBaseFeePerGas,
} from './test/setNextBlockBaseFeePerGas.js'
export {
  type SetNextBlockTimestampErrorType,
  type SetNextBlockTimestampParameters,
  setNextBlockTimestamp,
} from './test/setNextBlockTimestamp.js'
export {
  type SetNonceErrorType,
  type SetNonceParameters,
  setNonce,
} from './test/setNonce.js'
export { type SetRpcUrlErrorType, setRpcUrl } from './test/setRpcUrl.js'
export {
  type SetStorageAtErrorType,
  type SetStorageAtParameters,
  setStorageAt,
} from './test/setStorageAt.js'
export { type SnapshotErrorType, snapshot } from './test/snapshot.js'
export {
  type SignMessageErrorType,
  type SignMessageParameters,
  type SignMessageReturnType,
  signMessage,
} from './wallet/signMessage.js'
export {
  type SignTypedDataErrorType,
  type SignTypedDataParameters,
  type SignTypedDataReturnType,
  signTypedData,
} from './wallet/signTypedData.js'
export {
  type SimulateContractErrorType,
  type SimulateContractParameters,
  type SimulateContractReturnType,
  simulateContract,
} from './public/simulateContract.js'
export {
  type StopImpersonatingAccountErrorType,
  type StopImpersonatingAccountParameters,
  stopImpersonatingAccount,
} from './test/stopImpersonatingAccount.js'
export {
  type SwitchChainErrorType,
  type SwitchChainParameters,
  switchChain,
} from './wallet/switchChain.js'
export {
  type UninstallFilterErrorType,
  type UninstallFilterParameters,
  type UninstallFilterReturnType,
  uninstallFilter,
} from './public/uninstallFilter.js'
export {
  type VerifyHashErrorType,
  type VerifyHashParameters,
  type VerifyHashReturnType,
  verifyHash,
} from './public/verifyHash.js'
export {
  type VerifyMessageErrorType,
  type VerifyMessageParameters,
  type VerifyMessageReturnType,
  verifyMessage,
} from './public/verifyMessage.js'
export {
  type VerifyTypedDataErrorType,
  type VerifyTypedDataParameters,
  type VerifyTypedDataReturnType,
  verifyTypedData,
} from './public/verifyTypedData.js'
export {
  type WatchAssetErrorType,
  type WatchAssetParameters,
  type WatchAssetReturnType,
  watchAsset,
} from './wallet/watchAsset.js'
export {
  type WatchContractEventErrorType,
  type WatchContractEventParameters,
  type WatchContractEventReturnType,
  watchContractEvent,
} from './public/watchContractEvent.js'
export {
  type WriteContractErrorType,
  type WriteContractParameters,
  type WriteContractReturnType,
  writeContract,
} from './wallet/writeContract.js'
