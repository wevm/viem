import type { Abi, AbiEvent } from 'abitype'
import type {
  GetEnsAddressParameters,
  GetEnsAddressReturnType,
  GetEnsAvatarParameters,
  GetEnsAvatarReturnType,
  GetEnsNameParameters,
  GetEnsNameReturnType,
  GetEnsResolverParameters,
  GetEnsResolverReturnType,
  GetEnsTextParameters,
  GetEnsTextReturnType,
} from '../../actions/ens/index.js'
import {
  getEnsAddress,
  getEnsAvatar,
  getEnsName,
  getEnsResolver,
  getEnsText,
} from '../../actions/ens/index.js'
import type {
  CallParameters,
  CallReturnType,
  CreateBlockFilterReturnType,
  CreateContractEventFilterParameters,
  CreateContractEventFilterReturnType,
  CreateEventFilterParameters,
  CreateEventFilterReturnType,
  CreatePendingTransactionFilterReturnType,
  EstimateContractGasParameters,
  EstimateContractGasReturnType,
  EstimateGasParameters,
  EstimateGasReturnType,
  GetBalanceParameters,
  GetBalanceReturnType,
  GetBlockNumberParameters,
  GetBlockNumberReturnType,
  GetBlockParameters,
  GetBlockReturnType,
  GetBlockTransactionCountParameters,
  GetBlockTransactionCountReturnType,
  GetBytecodeParameters,
  GetBytecodeReturnType,
  GetChainIdReturnType,
  GetFeeHistoryParameters,
  GetFeeHistoryReturnType,
  GetFilterChangesParameters,
  GetFilterChangesReturnType,
  GetFilterLogsParameters,
  GetFilterLogsReturnType,
  GetGasPriceReturnType,
  GetLogsParameters,
  GetLogsReturnType,
  GetStorageAtParameters,
  GetStorageAtReturnType,
  GetTransactionConfirmationsParameters,
  GetTransactionConfirmationsReturnType,
  GetTransactionCountParameters,
  GetTransactionCountReturnType,
  GetTransactionParameters,
  GetTransactionReceiptParameters,
  GetTransactionReceiptReturnType,
  GetTransactionReturnType,
  MulticallParameters,
  MulticallReturnType,
  ReadContractParameters,
  ReadContractReturnType,
  SimulateContractParameters,
  SimulateContractReturnType,
  UninstallFilterParameters,
  UninstallFilterReturnType,
  WaitForTransactionReceiptParameters,
  WaitForTransactionReceiptReturnType,
  WatchBlockNumberParameters,
  WatchBlockNumberReturnType,
  WatchBlocksParameters,
  WatchBlocksReturnType,
  WatchContractEventParameters,
  WatchContractEventReturnType,
  WatchEventParameters,
  WatchEventReturnType,
  WatchPendingTransactionsParameters,
  WatchPendingTransactionsReturnType,
} from '../../actions/public/index.js'
import {
  call,
  createBlockFilter,
  createContractEventFilter,
  createEventFilter,
  createPendingTransactionFilter,
  estimateContractGas,
  estimateGas,
  getBalance,
  getBlock,
  getBlockNumber,
  getBlockTransactionCount,
  getBytecode,
  getChainId,
  getFeeHistory,
  getFilterChanges,
  getFilterLogs,
  getGasPrice,
  getLogs,
  getStorageAt,
  getTransaction,
  getTransactionConfirmations,
  getTransactionCount,
  getTransactionReceipt,
  multicall,
  readContract,
  simulateContract,
  uninstallFilter,
  waitForTransactionReceipt,
  watchBlockNumber,
  watchBlocks,
  watchContractEvent,
  watchEvent,
  watchPendingTransactions,
} from '../../actions/public/index.js'
import type {
  Chain,
  ContractFunctionConfig,
  FilterType,
  MaybeExtractEventArgsFromAbi,
} from '../../types/index.js'
import type { PublicClient } from '../createPublicClient.js'
import type { Transport } from '../transports/index.js'

export type PublicActions<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
> = {
  call: (args: CallParameters<TChain>) => Promise<CallReturnType>
  createBlockFilter: () => Promise<CreateBlockFilterReturnType>
  createContractEventFilter: <
    TAbi extends Abi | readonly unknown[],
    TEventName extends string | undefined,
    TArgs extends MaybeExtractEventArgsFromAbi<TAbi, TEventName> | undefined,
  >(
    args: CreateContractEventFilterParameters<TAbi, TEventName, TArgs>,
  ) => Promise<CreateContractEventFilterReturnType<TAbi, TEventName, TArgs>>
  createEventFilter: <
    TAbiEvent extends AbiEvent | undefined,
    TAbi extends Abi | readonly unknown[],
    TEventName extends string | undefined,
    TArgs extends MaybeExtractEventArgsFromAbi<TAbi, TEventName> | undefined,
  >(
    args?: CreateEventFilterParameters<TAbiEvent, TAbi, TEventName, TArgs>,
  ) => Promise<CreateEventFilterReturnType<TAbiEvent, TAbi, TEventName, TArgs>>
  createPendingTransactionFilter: () => Promise<CreatePendingTransactionFilterReturnType>
  estimateContractGas: <
    TChain extends Chain | undefined,
    TAbi extends Abi | readonly unknown[],
    TFunctionName extends string,
  >(
    args: EstimateContractGasParameters<TAbi, TFunctionName, TChain>,
  ) => Promise<EstimateContractGasReturnType>
  estimateGas: (
    args: EstimateGasParameters<TChain>,
  ) => Promise<EstimateGasReturnType>
  getBalance: (args: GetBalanceParameters) => Promise<GetBalanceReturnType>
  getBlock: (args?: GetBlockParameters) => Promise<GetBlockReturnType<TChain>>
  getBlockNumber: (
    args?: GetBlockNumberParameters,
  ) => Promise<GetBlockNumberReturnType>
  getBlockTransactionCount: (
    args?: GetBlockTransactionCountParameters,
  ) => Promise<GetBlockTransactionCountReturnType>
  getBytecode: (args: GetBytecodeParameters) => Promise<GetBytecodeReturnType>
  getChainId: () => Promise<GetChainIdReturnType>
  getEnsAddress: (
    args: GetEnsAddressParameters,
  ) => Promise<GetEnsAddressReturnType>
  getEnsAvatar: (
    args: GetEnsAvatarParameters,
  ) => Promise<GetEnsAvatarReturnType>
  getEnsName: (args: GetEnsNameParameters) => Promise<GetEnsNameReturnType>
  getEnsResolver: (
    args: GetEnsResolverParameters,
  ) => Promise<GetEnsResolverReturnType>
  getEnsText: (args: GetEnsTextParameters) => Promise<GetEnsTextReturnType>
  getFeeHistory: (
    args: GetFeeHistoryParameters,
  ) => Promise<GetFeeHistoryReturnType>
  getFilterChanges: <
    TFilterType extends FilterType,
    TAbiEvent extends AbiEvent | undefined,
    TAbi extends Abi | readonly unknown[],
    TEventName extends string | undefined,
  >(
    args: GetFilterChangesParameters<TFilterType, TAbiEvent, TAbi, TEventName>,
  ) => Promise<
    GetFilterChangesReturnType<TFilterType, TAbiEvent, TAbi, TEventName>
  >
  getFilterLogs: <
    TAbiEvent extends AbiEvent | undefined,
    TAbi extends Abi | readonly unknown[],
    TEventName extends string | undefined,
  >(
    args: GetFilterLogsParameters<TAbiEvent, TAbi, TEventName>,
  ) => Promise<GetFilterLogsReturnType<TAbiEvent, TAbi, TEventName>>
  getGasPrice: () => Promise<GetGasPriceReturnType>
  getLogs: <TAbiEvent extends AbiEvent | undefined>(
    args?: GetLogsParameters<TAbiEvent>,
  ) => Promise<GetLogsReturnType<TAbiEvent>>
  getStorageAt: (
    args: GetStorageAtParameters,
  ) => Promise<GetStorageAtReturnType>
  getTransaction: (
    args: GetTransactionParameters,
  ) => Promise<GetTransactionReturnType<TChain>>
  getTransactionConfirmations: (
    args: GetTransactionConfirmationsParameters<TChain>,
  ) => Promise<GetTransactionConfirmationsReturnType>
  getTransactionCount: (
    args: GetTransactionCountParameters,
  ) => Promise<GetTransactionCountReturnType>
  getTransactionReceipt: (
    args: GetTransactionReceiptParameters,
  ) => Promise<GetTransactionReceiptReturnType<TChain>>
  multicall: <
    TContracts extends ContractFunctionConfig[],
    TAllowFailure extends boolean = true,
  >(
    args: MulticallParameters<TContracts, TAllowFailure>,
  ) => Promise<MulticallReturnType<TContracts, TAllowFailure>>
  readContract: <
    TAbi extends Abi | readonly unknown[],
    TFunctionName extends string,
  >(
    args: ReadContractParameters<TAbi, TFunctionName>,
  ) => Promise<ReadContractReturnType<TAbi, TFunctionName>>
  simulateContract: <
    TAbi extends Abi | readonly unknown[] = Abi,
    TFunctionName extends string = any,
    TChainOverride extends Chain | undefined = undefined,
  >(
    args: SimulateContractParameters<
      TAbi,
      TFunctionName,
      TChain,
      TChainOverride
    >,
  ) => Promise<
    SimulateContractReturnType<TAbi, TFunctionName, TChain, TChainOverride>
  >
  uninstallFilter: (
    args: UninstallFilterParameters,
  ) => Promise<UninstallFilterReturnType>
  waitForTransactionReceipt: (
    args: WaitForTransactionReceiptParameters<TChain>,
  ) => Promise<WaitForTransactionReceiptReturnType<TChain>>
  watchBlockNumber: (
    args: WatchBlockNumberParameters,
  ) => WatchBlockNumberReturnType
  watchBlocks: (
    args: WatchBlocksParameters<TTransport, TChain>,
  ) => WatchBlocksReturnType
  watchContractEvent: <
    TAbi extends Abi | readonly unknown[],
    TEventName extends string,
  >(
    args: WatchContractEventParameters<TAbi, TEventName>,
  ) => WatchContractEventReturnType
  watchEvent: <TAbiEvent extends AbiEvent | undefined>(
    args: WatchEventParameters<TAbiEvent>,
  ) => WatchEventReturnType
  watchPendingTransactions: (
    args: WatchPendingTransactionsParameters<TTransport>,
  ) => WatchPendingTransactionsReturnType
}

export const publicActions: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
>(
  client: PublicClient<TTransport, TChain>,
) => PublicActions<TTransport, TChain> = <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
>(
  client: PublicClient<TTransport, TChain>,
): PublicActions<TTransport, TChain> => ({
  call: (args) => call(client, args),
  createBlockFilter: () => createBlockFilter(client),
  createContractEventFilter: (args) => createContractEventFilter(client, args),
  createEventFilter: (args) => createEventFilter(client, args),
  createPendingTransactionFilter: () => createPendingTransactionFilter(client),
  estimateContractGas: (args) => estimateContractGas(client, args),
  estimateGas: (args) => estimateGas(client, args),
  getBalance: (args) => getBalance(client, args),
  getBlock: (args) => getBlock(client, args),
  getBlockNumber: (args) => getBlockNumber(client, args),
  getBlockTransactionCount: (args) => getBlockTransactionCount(client, args),
  getBytecode: (args) => getBytecode(client, args),
  getChainId: () => getChainId(client),
  getEnsAddress: (args) => getEnsAddress(client, args),
  getEnsAvatar: (args) => getEnsAvatar(client, args),
  getEnsName: (args) => getEnsName(client, args),
  getEnsResolver: (args) => getEnsResolver(client, args),
  getEnsText: (args) => getEnsText(client, args),
  getFeeHistory: (args) => getFeeHistory(client, args),
  getFilterChanges: (args) => getFilterChanges(client, args),
  getFilterLogs: (args) => getFilterLogs(client, args),
  getGasPrice: () => getGasPrice(client),
  getLogs: (args) => getLogs(client, args),
  getStorageAt: (args) => getStorageAt(client, args),
  getTransaction: (args) => getTransaction(client, args),
  getTransactionConfirmations: (args) =>
    getTransactionConfirmations(client, args),
  getTransactionCount: (args) => getTransactionCount(client, args),
  getTransactionReceipt: (args) => getTransactionReceipt(client, args),
  multicall: (args) => multicall(client, args),
  readContract: (args) => readContract(client, args),
  simulateContract: (args) => simulateContract(client, args),
  uninstallFilter: (args) => uninstallFilter(client, args),
  waitForTransactionReceipt: (args) => waitForTransactionReceipt(client, args),
  watchBlocks: (args) => watchBlocks(client, args),
  watchBlockNumber: (args) => watchBlockNumber(client, args),
  watchContractEvent: (args) => watchContractEvent(client, args),
  watchEvent: (args) => watchEvent(client, args),
  watchPendingTransactions: (args) => watchPendingTransactions(client, args),
})
