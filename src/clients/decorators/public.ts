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
  /**
   * Gets address for ENS name.
   *
   * - Docs: https://viem.sh/docs/ens/actions/getEnsAddress.html
   * - Examples: https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/ens
   *
   * @remarks
   * Calls `resolve(bytes, bytes)` on ENS Universal Resolver Contract.
   *
   * Since ENS names prohibit certain forbidden characters (e.g. underscore) and have other validation rules, you likely want to [normalize ENS names](https://docs.ens.domains/contract-api-reference/name-processing#normalising-names) with [UTS-46 normalization](https://unicode.org/reports/tr46) before passing them to `getEnsAddress`. You can use the built-in [`normalize`](https://viem.sh/docs/ens/utilities/normalize.html) function for this.
   *
   * @param parameters - {@link GetEnsAddressParameters}
   * @returns Address for ENS name or `null` if not found. {@link GetEnsAddressReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { normalize } from 'viem/ens'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const ensAddress = await client.getEnsAddress({
   *   name: normalize('wagmi-dev.eth'),
   * })
   * // '0xd2135CfB216b74109775236E36d4b433F1DF507B'
   */
  getEnsAddress: (
    args: GetEnsAddressParameters,
  ) => Promise<GetEnsAddressReturnType>
  /**
   * Gets the avatar of an ENS name.
   *
   * - Docs: https://viem.sh/docs/ens/actions/getEnsAvatar.html
   * - Examples: https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/ens
   *
   * @remarks
   * Calls [`getEnsText`](https://viem.sh/docs/ens/actions/getEnsText.html) with `key` set to `'avatar'`.
   *
   * Since ENS names prohibit certain forbidden characters (e.g. underscore) and have other validation rules, you likely want to [normalize ENS names](https://docs.ens.domains/contract-api-reference/name-processing#normalising-names) with [UTS-46 normalization](https://unicode.org/reports/tr46) before passing them to `getEnsAddress`. You can use the built-in [`normalize`](https://viem.sh/docs/ens/utilities/normalize.html) function for this.
   *
   * @param parameters - {@link GetEnsAvatarParameters}
   * @returns Avatar URI or `null` if not found. {@link GetEnsAvatarReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { normalize } from 'viem/ens'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const ensAvatar = await client.getEnsAvatar({
   *   name: normalize('wagmi-dev.eth'),
   * })
   * // 'https://ipfs.io/ipfs/Qma8mnp6xV3J2cRNf3mTth5C8nV11CAnceVinc3y8jSbio'
   */
  getEnsAvatar: (
    args: GetEnsAvatarParameters,
  ) => Promise<GetEnsAvatarReturnType>
  /**
   * Gets primary name for specified address.
   *
   * - Docs: https://viem.sh/docs/ens/actions/getEnsName.html
   * - Examples: https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/ens
   *
   * @remarks
   * Calls `reverse(bytes)` on ENS Universal Resolver Contract to "reverse resolve" the address to the primary ENS name.
   *
   * @param parameters - {@link GetEnsNameParameters}
   * @returns Name or `null` if not found. {@link GetEnsNameReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const ensName = await client.getEnsName({
   *   address: '0xd2135CfB216b74109775236E36d4b433F1DF507B',
   * })
   * // 'wagmi-dev.eth'
   */
  getEnsName: (args: GetEnsNameParameters) => Promise<GetEnsNameReturnType>
  /**
   * Gets resolver for ENS name.
   *
   * - Docs: https://viem.sh/docs/ens/actions/getEnsResolver.html
   * - Examples: https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/ens
   *
   * @remarks
   * Calls `findResolver(bytes)` on ENS Universal Resolver Contract to retrieve the resolver of an ENS name.
   *
   * Since ENS names prohibit certain forbidden characters (e.g. underscore) and have other validation rules, you likely want to [normalize ENS names](https://docs.ens.domains/contract-api-reference/name-processing#normalising-names) with [UTS-46 normalization](https://unicode.org/reports/tr46) before passing them to `getEnsAddress`. You can use the built-in [`normalize`](https://viem.sh/docs/ens/utilities/normalize.html) function for this.
   *
   * @param parameters - {@link GetEnsResolverParameters}
   * @returns Address for ENS resolver. {@link GetEnsResolverReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { normalize } from 'viem/ens'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const resolverAddress = await client.getEnsResolver({
   *   name: normalize('wagmi-dev.eth'),
   * })
   * // '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41'
   */
  getEnsResolver: (
    args: GetEnsResolverParameters,
  ) => Promise<GetEnsResolverReturnType>
  /**
   * Gets a text record for specified ENS name.
   *
   * - Docs: https://viem.sh/docs/ens/actions/getEnsResolver.html
   * - Examples: https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/ens
   *
   * @remarks
   * Calls `resolve(bytes, bytes)` on ENS Universal Resolver Contract.
   *
   * Since ENS names prohibit certain forbidden characters (e.g. underscore) and have other validation rules, you likely want to [normalize ENS names](https://docs.ens.domains/contract-api-reference/name-processing#normalising-names) with [UTS-46 normalization](https://unicode.org/reports/tr46) before passing them to `getEnsAddress`. You can use the built-in [`normalize`](https://viem.sh/docs/ens/utilities/normalize.html) function for this.
   *
   * @param parameters - {@link GetEnsTextParameters}
   * @returns Address for ENS resolver. {@link GetEnsTextReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { normalize } from 'viem/ens'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const twitterRecord = await client.getEnsText({
   *   name: normalize('wagmi-dev.eth'),
   *   key: 'com.twitter',
   * })
   * // 'wagmi_sh'
   */
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
