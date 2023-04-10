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
  /**
   * Executes a new message call immediately without submitting a transaction to the network.
   *
   * - Docs: https://viem.sh/docs/actions/public/call.html
   * - JSON-RPC Methods: [`eth_call`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_call)
   *
   * @param client - Client to use
   * @param parameters - {@link CallParameters}
   * @returns The call data. {@link CallReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const data = await client.call({
   *   account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
   *   data: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
   *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
   * })
   */
  call: (args: CallParameters<TChain>) => Promise<CallReturnType>
  /**
   * Creates a Filter to listen for new block hashes that can be used with [`getFilterChanges`](https://viem.sh/docs/actions/public/getFilterChanges).
   *
   * - Docs: https://viem.sh/docs/actions/public/createBlockFilter.html
   * - JSON-RPC Methods: [`eth_newBlockFilter`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_newBlockFilter)
   *
   * @param client - Client to use
   * @returns Filter. {@link CreateBlockFilterReturnType}
   *
   * @example
   * import { createPublicClient, createBlockFilter, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const filter = await createBlockFilter(client)
   * // { id: "0x345a6572337856574a76364e457a4366", type: 'block' }
   */
  createBlockFilter: () => Promise<CreateBlockFilterReturnType>
  createContractEventFilter: <
    TAbi extends Abi | readonly unknown[],
    TEventName extends string | undefined,
    TArgs extends MaybeExtractEventArgsFromAbi<TAbi, TEventName> | undefined,
  >(
    args: CreateContractEventFilterParameters<TAbi, TEventName, TArgs>,
  ) => Promise<CreateContractEventFilterReturnType<TAbi, TEventName, TArgs>>
  /**
   * Creates a [`Filter`](https://viem.sh/docs/glossary/types.html#filter) to listen for new events that can be used with [`getFilterChanges`](https://viem.sh/docs/actions/public/getFilterChanges).
   *
   * - Docs: https://viem.sh/docs/actions/public/createEventFilter.html
   * - JSON-RPC Methods: [`eth_newFilter`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_newfilter)
   *
   * @param parameters - {@link CreateEventFilterParameters}
   * @returns [`Filter`](https://viem.sh/docs/glossary/types.html#filter). {@link CreateEventFilterReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const filter = await client.createEventFilter({
   *   address: '0xfba3912ca04dd458c843e2ee08967fc04f3579c2',
   * })
   */
  createEventFilter: <
    TAbiEvent extends AbiEvent | undefined,
    TAbi extends Abi | readonly unknown[],
    TEventName extends string | undefined,
    TArgs extends MaybeExtractEventArgsFromAbi<TAbi, TEventName> | undefined,
  >(
    args?: CreateEventFilterParameters<TAbiEvent, TAbi, TEventName, TArgs>,
  ) => Promise<CreateEventFilterReturnType<TAbiEvent, TAbi, TEventName, TArgs>>
  /**
   * Creates a Filter to listen for new pending transaction hashes that can be used with [`getFilterChanges`](https://viem.sh/docs/actions/public/getFilterChanges).
   *
   * - Docs: https://viem.sh/docs/actions/public/createPendingTransactionFilter.html
   * - JSON-RPC Methods: [`eth_newPendingTransactionFilter`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_newpendingtransactionfilter)
   *
   * @returns [`Filter`](https://viem.sh/docs/glossary/types.html#filter). {@link CreateBlockFilterReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const filter = await client.createPendingTransactionFilter()
   * // { id: "0x345a6572337856574a76364e457a4366", type: 'transaction' }
   */
  createPendingTransactionFilter: () => Promise<CreatePendingTransactionFilterReturnType>
  estimateContractGas: <
    TChain extends Chain | undefined,
    TAbi extends Abi | readonly unknown[],
    TFunctionName extends string,
  >(
    args: EstimateContractGasParameters<TAbi, TFunctionName, TChain>,
  ) => Promise<EstimateContractGasReturnType>
  /**
   * Estimates the gas necessary to complete a transaction without submitting it to the network.
   *
   * - Docs: https://viem.sh/docs/actions/public/estimateGas.html
   * - JSON-RPC Methods: [`eth_estimateGas`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_estimategas)
   *
   * @param parameters - {@link EstimateGasParameters}
   * @returns The gas estimate (in wei). {@link EstimateGasReturnType}
   *
   * @example
   * import { createPublicClient, http, parseEther } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const gasEstimate = await client.estimateGas({
   *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
   *   value: parseEther('1'),
   * })
   */
  estimateGas: (
    args: EstimateGasParameters<TChain>,
  ) => Promise<EstimateGasReturnType>
  /**
   * Returns the balance of an address in wei.
   *
   * - Docs: https://viem.sh/docs/actions/public/getBalance.html
   * - JSON-RPC Methods: [`eth_getBalance`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getbalance)
   *
   * @remarks
   * You can convert the balance to ether units with [`formatEther`](https://viem.sh/docs/utilities/formatEther.html).
   *
   * ```ts
   * const balance = await getBalance(client, {
   *   address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   *   blockTag: 'safe'
   * })
   * const balanceAsEther = formatEther(balance)
   * // "6.942"
   * ```
   *
   * @param parameters - {@link GetBalanceParameters}
   * @returns The balance of the address in wei. {@link GetBalanceReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const balance = await client.getBalance({
   *   address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   * })
   * // 10000000000000000000000n (wei)
   */
  getBalance: (args: GetBalanceParameters) => Promise<GetBalanceReturnType>
  /**
   * Returns information about a block at a block number, hash, or tag.
   *
   * - Docs: https://viem.sh/docs/actions/public/getBlock.html
   * - Examples: https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/blocks/fetching-blocks
   * - JSON-RPC Methods:
   *   - Calls [`eth_getBlockByNumber`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getblockbynumber) for `blockNumber` & `blockTag`.
   *   - Calls [`eth_getBlockByHash`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getblockbyhash) for `blockHash`.
   *
   * @param parameters - {@link GetBlockParameters}
   * @returns Information about the block. {@link GetBlockReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const block = await client.getBlock()
   */
  getBlock: (args?: GetBlockParameters) => Promise<GetBlockReturnType<TChain>>
  /**
   * Returns the number of the most recent block seen.
   *
   * - Docs: https://viem.sh/docs/actions/public/getBlockNumber.html
   * - Examples: https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/blocks/fetching-blocks
   * - JSON-RPC Methods: [`eth_blockNumber`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_blocknumber)
   *
   * @param parameters - {@link GetBlockNumberParameters}
   * @returns The number of the block. {@link GetBlockNumberReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const blockNumber = await client.getBlockNumber()
   * // 69420n
   */
  getBlockNumber: (
    args?: GetBlockNumberParameters,
  ) => Promise<GetBlockNumberReturnType>
  /**
   * Returns the number of Transactions at a block number, hash, or tag.
   *
   * - Docs: https://viem.sh/docs/actions/public/getBlockTransactionCount.html
   * - JSON-RPC Methods:
   *   - Calls [`eth_getBlockTransactionCountByNumber`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getblocktransactioncountbynumber) for `blockNumber` & `blockTag`.
   *   - Calls [`eth_getBlockTransactionCountByHash`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getblocktransactioncountbyhash) for `blockHash`.
   *
   * @param parameters - {@link GetBlockTransactionCountParameters}
   * @returns The block transaction count. {@link GetBlockTransactionCountReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const count = await client.getBlockTransactionCount()
   */
  getBlockTransactionCount: (
    args?: GetBlockTransactionCountParameters,
  ) => Promise<GetBlockTransactionCountReturnType>
  getBytecode: (args: GetBytecodeParameters) => Promise<GetBytecodeReturnType>
  /**
   * Returns the chain ID associated with the current network.
   *
   * - Docs: https://viem.sh/docs/actions/public/getChainId.html
   * - JSON-RPC Methods: [`eth_chainId`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_chainid)
   *
   * @returns The current chain ID. {@link GetChainIdReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const chainId = await client.getChainId()
   * // 1
   */
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
  /**
   * Returns a collection of historical gas information.
   *
   * - Docs: https://viem.sh/docs/actions/public/getFeeHistory.html
   * - JSON-RPC Methods: [`eth_feeHistory`](https://docs.alchemy.com/reference/eth-feehistory)
   *
   * @param parameters - {@link GetFeeHistoryParameters}
   * @returns The gas estimate (in wei). {@link GetFeeHistoryReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const feeHistory = await client.getFeeHistory({
   *   blockCount: 4,
   *   rewardPercentiles: [25, 75],
   * })
   */
  getFeeHistory: (
    args: GetFeeHistoryParameters,
  ) => Promise<GetFeeHistoryReturnType>
  /**
   * Returns a list of logs or hashes based on a [Filter](/docs/glossary/terms#filter) since the last time it was called.
   *
   * - Docs: https://viem.sh/docs/actions/public/getFilterChanges.html
   * - JSON-RPC Methods: [`eth_getFilterChanges`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getfilterchanges)
   *
   * @remarks
   * A Filter can be created from the following actions:
   *
   * - [`createBlockFilter`](https://viem.sh/docs/actions/public/createBlockFilter)
   * - [`createContractEventFilter`](https://viem.sh/docs/contract/createContractEventFilter)
   * - [`createEventFilter`](https://viem.sh/docs/actions/public/createEventFilter)
   * - [`createPendingTransactionFilter`](https://viem.sh/docs/actions/public/createPendingTransactionFilter)
   *
   * Depending on the type of filter, the return value will be different:
   *
   * - If the filter was created with `createContractEventFilter` or `createEventFilter`, it returns a list of logs.
   * - If the filter was created with `createPendingTransactionFilter`, it returns a list of transaction hashes.
   * - If the filter was created with `createBlockFilter`, it returns a list of block hashes.
   *
   * @param parameters - {@link GetFilterChangesParameters}
   * @returns Logs or hashes. {@link GetFilterChangesReturnType}
   *
   * @example
   * // Blocks
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const filter = await client.createBlockFilter()
   * const hashes = await client.getFilterChanges({ filter })
   *
   * @example
   * // Contract Events
   * import { createPublicClient, http, parseAbi } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const filter = await client.createContractEventFilter({
   *   address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
   *   abi: parseAbi(['event Transfer(address indexed, address indexed, uint256)']),
   *   eventName: 'Transfer',
   * })
   * const logs = await client.getFilterChanges({ filter })
   *
   * @example
   * // Raw Events
   * import { createPublicClient, http, parseAbiItem } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const filter = await client.createEventFilter({
   *   address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
   *   event: parseAbiItem('event Transfer(address indexed, address indexed, uint256)'),
   * })
   * const logs = await client.getFilterChanges({ filter })
   *
   * @example
   * // Transactions
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const filter = await client.createPendingTransactionFilter()
   * const hashes = await client.getFilterChanges({ filter })
   */
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
  /**
   * Returns the current price of gas (in wei).
   *
   * - Docs: https://viem.sh/docs/actions/public/getGasPrice.html
   * - JSON-RPC Methods: [`eth_gasPrice`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_gasprice)
   *
   * @returns The gas price (in wei). {@link GetGasPriceReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const gasPrice = await client.getGasPrice()
   */
  getGasPrice: () => Promise<GetGasPriceReturnType>
  getLogs: <TAbiEvent extends AbiEvent | undefined>(
    args?: GetLogsParameters<TAbiEvent>,
  ) => Promise<GetLogsReturnType<TAbiEvent>>
  getStorageAt: (
    args: GetStorageAtParameters,
  ) => Promise<GetStorageAtReturnType>
  /**
   * Returns information about a [Transaction](https://viem.sh/docs/glossary/terms#transaction) given a hash or block identifier.
   *
   * - Docs: https://viem.sh/docs/actions/public/getTransaction.html
   * - Example: https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/transactions/fetching-transactions
   * - JSON-RPC Methods: [`eth_getTransactionByHash`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getTransactionByHash)
   *
   * @param parameters - {@link GetTransactionParameters}
   * @returns The transaction information. {@link GetTransactionReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const transaction = await client.getTransaction({
   *   hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
   * })
   */
  getTransaction: (
    args: GetTransactionParameters,
  ) => Promise<GetTransactionReturnType<TChain>>
  /**
   * Returns the number of blocks passed (confirmations) since the transaction was processed on a block.
   *
   * - Docs: https://viem.sh/docs/actions/public/getTransactionConfirmations.html
   * - Example: https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/transactions/fetching-transactions
   * - JSON-RPC Methods: [`eth_getTransactionConfirmations`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getTransactionConfirmations)
   *
   * @param parameters - {@link GetTransactionConfirmationsParameters}
   * @returns The number of blocks passed since the transaction was processed. If confirmations is 0, then the Transaction has not been confirmed & processed yet. {@link GetTransactionConfirmationsReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const confirmations = await client.getTransactionConfirmations({
   *   hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
   * })
   */
  getTransactionConfirmations: (
    args: GetTransactionConfirmationsParameters<TChain>,
  ) => Promise<GetTransactionConfirmationsReturnType>
  /**
   * Returns the number of [Transactions](https://viem.sh/docs/glossary/terms#transaction) an Account has broadcast / sent.
   *
   * - Docs: https://viem.sh/docs/actions/public/getTransactionCount.html
   * - JSON-RPC Methods: [`eth_getTransactionCount`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_gettransactioncount)
   *
   * @param parameters - {@link GetTransactionCountParameters}
   * @returns The number of transactions an account has sent. {@link GetTransactionCountReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const transactionCount = await client.getTransactionCount({
   *   address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   * })
   */
  getTransactionCount: (
    args: GetTransactionCountParameters,
  ) => Promise<GetTransactionCountReturnType>
  /**
   * Returns the [Transaction Receipt](https://viem.sh/docs/glossary/terms#transaction-receipt) given a [Transaction](https://viem.sh/docs/glossary/terms#transaction) hash.
   *
   * - Docs: https://viem.sh/docs/actions/public/getTransactionReceipt.html
   * - Example: https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/transactions/fetching-transactions
   * - JSON-RPC Methods: [`eth_getTransactionReceipt`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getTransactionReceipt)
   *
   * @param parameters - {@link GetTransactionReceiptParameters}
   * @returns The transaction receipt. {@link GetTransactionReceiptReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const transactionReceipt = await client.getTransactionReceipt({
   *   hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
   * })
   */
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
  /**
   * Waits for the [Transaction](https://viem.sh/docs/glossary/terms.html#transaction) to be included on a [Block](https://viem.sh/docs/glossary/terms.html#block) (one confirmation), and then returns the [Transaction Receipt](https://viem.sh/docs/glossary/terms.html#transaction-receipt). If the Transaction reverts, then the action will throw an error.
   *
   * - Docs: https://viem.sh/docs/actions/public/waitForTransactionReceipt.html
   * - Example: https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/transactions/sending-transactions
   * - JSON-RPC Methods:
   *   - Polls [`eth_getTransactionReceipt`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getTransactionReceipt) on each block until it has been processed.
   *   - If a Transaction has been replaced:
   *     - Calls [`eth_getBlockByNumber`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getblockbynumber) and extracts the transactions
   *     - Checks if one of the Transactions is a replacement
   *     - If so, calls [`eth_getTransactionReceipt`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getTransactionReceipt).
   *
   * @remarks
   * The `waitForTransactionReceipt` action additionally supports Replacement detection (e.g. sped up Transactions).
   *
   * Transactions can be replaced when a user modifies their transaction in their wallet (to speed up or cancel). Transactions are replaced when they are sent from the same nonce.
   *
   * There are 3 types of Transaction Replacement reasons:
   *
   * - `repriced`: The gas price has been modified (e.g. different `maxFeePerGas`)
   * - `cancelled`: The Transaction has been cancelled (e.g. `value === 0n`)
   * - `replaced`: The Transaction has been replaced (e.g. different `value` or `data`)
   *
   * @param parameters - {@link WaitForTransactionReceiptParameters}
   * @returns The transaction receipt. {@link WaitForTransactionReceiptReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const transactionReceipt = await client.waitForTransactionReceipt({
   *   hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
   * })
   */
  waitForTransactionReceipt: (
    args: WaitForTransactionReceiptParameters<TChain>,
  ) => Promise<WaitForTransactionReceiptReturnType<TChain>>
  /**
   * Watches and returns incoming block numbers.
   *
   * - Docs: https://viem.sh/docs/actions/public/watchBlockNumber.html
   * - Examples: https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/blocks/watching-blocks
   * - JSON-RPC Methods:
   *   - When `poll: true`, calls [`eth_blockNumber`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_blocknumber) on a polling interval.
   *   - When `poll: false` & WebSocket Transport, uses a WebSocket subscription via [`eth_subscribe`](https://docs.alchemy.com/reference/eth-subscribe-polygon) and the `"newHeads"` event.
   *
   * @param parameters - {@link WatchBlockNumberParameters}
   * @returns A function that can be invoked to stop watching for new block numbers. {@link WatchBlockNumberReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const unwatch = await client.watchBlockNumber({
   *   onBlockNumber: (blockNumber) => console.log(blockNumber),
   * })
   */
  watchBlockNumber: (
    args: WatchBlockNumberParameters,
  ) => WatchBlockNumberReturnType
  /**
   * Watches and returns information for incoming blocks.
   *
   * - Docs: https://viem.sh/docs/actions/public/watchBlocks.html
   * - Examples: https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/blocks/watching-blocks
   * - JSON-RPC Methods:
   *   - When `poll: true`, calls [`eth_getBlockByNumber`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getBlockByNumber) on a polling interval.
   *   - When `poll: false` & WebSocket Transport, uses a WebSocket subscription via [`eth_subscribe`](https://docs.alchemy.com/reference/eth-subscribe-polygon) and the `"newHeads"` event.
   *
   * @param parameters - {@link WatchBlocksParameters}
   * @returns A function that can be invoked to stop watching for new block numbers. {@link WatchBlocksReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const unwatch = await client.watchBlocks({
   *   onBlock: (block) => console.log(block),
   * })
   */
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
  /**
   * Watches and returns pending transaction hashes.
   *
   * - Docs: https://viem.sh/docs/actions/public/watchPendingTransactions.html
   * - JSON-RPC Methods:
   *   - When `poll: true`
   *     - Calls [`eth_newPendingTransactionFilter`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_newpendingtransactionfilter) to initialize the filter.
   *     - Calls [`eth_getFilterChanges`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getFilterChanges) on a polling interval.
   *   - When `poll: false` & WebSocket Transport, uses a WebSocket subscription via [`eth_subscribe`](https://docs.alchemy.com/reference/eth-subscribe-polygon) and the `"newPendingTransactions"` event.
   *
   * @remarks
   * This Action will batch up all the pending transactions found within the [`pollingInterval`](https://viem.sh/docs/actions/public/watchPendingTransactions.html#pollinginterval-optional), and invoke them via [`onTransactions`](https://viem.sh/docs/actions/public/watchPendingTransactions.html#ontransactions).
   *
   * @param parameters - {@link WatchPendingTransactionsParameters}
   * @returns A function that can be invoked to stop watching for new pending transaction hashes. {@link WatchPendingTransactionsReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const unwatch = await client.watchPendingTransactions({
   *   onTransactions: (hashes) => console.log(hashes),
   * })
   */
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
