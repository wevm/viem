import type { Abi, AbiEvent } from 'abitype'

import {
  type GetEnsAddressParameters,
  type GetEnsAddressReturnType,
  getEnsAddress,
} from '../../actions/ens/getEnsAddress.js'
import {
  type GetEnsAvatarParameters,
  type GetEnsAvatarReturnType,
  getEnsAvatar,
} from '../../actions/ens/getEnsAvatar.js'
import {
  type GetEnsNameParameters,
  type GetEnsNameReturnType,
  getEnsName,
} from '../../actions/ens/getEnsName.js'
import {
  type GetEnsResolverParameters,
  type GetEnsResolverReturnType,
  getEnsResolver,
} from '../../actions/ens/getEnsResolver.js'
import {
  type GetEnsTextParameters,
  type GetEnsTextReturnType,
  getEnsText,
} from '../../actions/ens/getEnsText.js'
import {
  type CallParameters,
  type CallReturnType,
  call,
} from '../../actions/public/call.js'
import {
  type CreateBlockFilterReturnType,
  createBlockFilter,
} from '../../actions/public/createBlockFilter.js'
import {
  type CreateContractEventFilterParameters,
  type CreateContractEventFilterReturnType,
  createContractEventFilter,
} from '../../actions/public/createContractEventFilter.js'
import {
  type CreateEventFilterParameters,
  type CreateEventFilterReturnType,
  createEventFilter,
} from '../../actions/public/createEventFilter.js'
import {
  type CreatePendingTransactionFilterReturnType,
  createPendingTransactionFilter,
} from '../../actions/public/createPendingTransactionFilter.js'
import {
  type EstimateContractGasParameters,
  type EstimateContractGasReturnType,
  estimateContractGas,
} from '../../actions/public/estimateContractGas.js'
import {
  type EstimateGasParameters,
  type EstimateGasReturnType,
  estimateGas,
} from '../../actions/public/estimateGas.js'
import {
  type GetBalanceParameters,
  type GetBalanceReturnType,
  getBalance,
} from '../../actions/public/getBalance.js'
import {
  type GetBlockParameters,
  type GetBlockReturnType,
  getBlock,
} from '../../actions/public/getBlock.js'
import {
  type GetBlockNumberParameters,
  type GetBlockNumberReturnType,
  getBlockNumber,
} from '../../actions/public/getBlockNumber.js'
import {
  type GetBlockTransactionCountParameters,
  type GetBlockTransactionCountReturnType,
  getBlockTransactionCount,
} from '../../actions/public/getBlockTransactionCount.js'
import {
  type GetBytecodeParameters,
  type GetBytecodeReturnType,
  getBytecode,
} from '../../actions/public/getBytecode.js'
import {
  type GetChainIdReturnType,
  getChainId,
} from '../../actions/public/getChainId.js'
import {
  type GetFeeHistoryParameters,
  type GetFeeHistoryReturnType,
  getFeeHistory,
} from '../../actions/public/getFeeHistory.js'
import {
  type GetFilterChangesParameters,
  type GetFilterChangesReturnType,
  getFilterChanges,
} from '../../actions/public/getFilterChanges.js'
import {
  type GetFilterLogsParameters,
  type GetFilterLogsReturnType,
  getFilterLogs,
} from '../../actions/public/getFilterLogs.js'
import {
  type GetGasPriceReturnType,
  getGasPrice,
} from '../../actions/public/getGasPrice.js'
import {
  type GetLogsParameters,
  type GetLogsReturnType,
  getLogs,
} from '../../actions/public/getLogs.js'
import {
  type GetStorageAtParameters,
  type GetStorageAtReturnType,
  getStorageAt,
} from '../../actions/public/getStorageAt.js'
import {
  type GetTransactionParameters,
  type GetTransactionReturnType,
  getTransaction,
} from '../../actions/public/getTransaction.js'
import {
  type GetTransactionConfirmationsParameters,
  type GetTransactionConfirmationsReturnType,
  getTransactionConfirmations,
} from '../../actions/public/getTransactionConfirmations.js'
import {
  type GetTransactionCountParameters,
  type GetTransactionCountReturnType,
  getTransactionCount,
} from '../../actions/public/getTransactionCount.js'
import {
  type GetTransactionReceiptParameters,
  type GetTransactionReceiptReturnType,
  getTransactionReceipt,
} from '../../actions/public/getTransactionReceipt.js'
import {
  type MulticallParameters,
  type MulticallReturnType,
  multicall,
} from '../../actions/public/multicall.js'
import {
  type ReadContractParameters,
  type ReadContractReturnType,
  readContract,
} from '../../actions/public/readContract.js'
import {
  type SimulateContractParameters,
  type SimulateContractReturnType,
  simulateContract,
} from '../../actions/public/simulateContract.js'
import {
  type UninstallFilterParameters,
  type UninstallFilterReturnType,
  uninstallFilter,
} from '../../actions/public/uninstallFilter.js'
import {
  type VerifyMessageParameters,
  type VerifyMessageReturnType,
  verifyMessage,
} from '../../actions/public/verifyMessage.js'
import {
  type VerifyTypedDataParameters,
  type VerifyTypedDataReturnType,
  verifyTypedData,
} from '../../actions/public/verifyTypedData.js'
import {
  type WaitForTransactionReceiptParameters,
  type WaitForTransactionReceiptReturnType,
  waitForTransactionReceipt,
} from '../../actions/public/waitForTransactionReceipt.js'
import {
  type WatchBlockNumberParameters,
  type WatchBlockNumberReturnType,
  watchBlockNumber,
} from '../../actions/public/watchBlockNumber.js'
import {
  type WatchBlocksParameters,
  type WatchBlocksReturnType,
  watchBlocks,
} from '../../actions/public/watchBlocks.js'
import {
  type WatchContractEventParameters,
  type WatchContractEventReturnType,
  watchContractEvent,
} from '../../actions/public/watchContractEvent.js'
import {
  type WatchEventParameters,
  type WatchEventReturnType,
  watchEvent,
} from '../../actions/public/watchEvent.js'
import {
  type WatchPendingTransactionsParameters,
  type WatchPendingTransactionsReturnType,
  watchPendingTransactions,
} from '../../actions/public/watchPendingTransactions.js'
import type { Chain } from '../../types/chain.js'
import type {
  ContractFunctionConfig,
  MaybeExtractEventArgsFromAbi,
} from '../../types/contract.js'
import type { FilterType } from '../../types/filter.js'
import type { PublicClient } from '../createPublicClient.js'
import type { Transport } from '../transports/createTransport.js'

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
   * @param args - {@link CallParameters}
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
  call: (parameters: CallParameters<TChain>) => Promise<CallReturnType>
  /**
   * Creates a Filter to listen for new block hashes that can be used with [`getFilterChanges`](https://viem.sh/docs/actions/public/getFilterChanges).
   *
   * - Docs: https://viem.sh/docs/actions/public/createBlockFilter.html
   * - JSON-RPC Methods: [`eth_newBlockFilter`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_newBlockFilter)
   *
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
  /**
   * Creates a Filter to retrieve event logs that can be used with [`getFilterChanges`](https://viem.sh/docs/actions/public/getFilterChanges) or [`getFilterLogs`](https://viem.sh/docs/actions/public/getFilterLogs).
   *
   * - Docs: https://viem.sh/docs/contract/createContractEventFilter.html
   *
   * @param args - {@link CreateContractEventFilterParameters}
   * @returns [`Filter`](https://viem.sh/docs/glossary/types.html#filter). {@link CreateContractEventFilterReturnType}
   *
   * @example
   * import { createPublicClient, http, parseAbi } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const filter = await client.createContractEventFilter({
   *   abi: parseAbi(['event Transfer(address indexed, address indexed, uint256)']),
   * })
   */
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
   * @param args - {@link CreateEventFilterParameters}
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
  /**
   * Estimates the gas required to successfully execute a contract write function call.
   *
   * - Docs: https://viem.sh/docs/contract/estimateContractGas.html
   *
   * @remarks
   * Internally, uses a [Public Client](https://viem.sh/docs/clients/public) to call the [`estimateGas` action](https://viem.sh/docs/actions/public/estimateGas) with [ABI-encoded `data`](https://viem.sh/docs/contract/encodeFunctionData).
   *
   * @param args - {@link EstimateContractGasParameters}
   * @returns The gas estimate (in wei). {@link EstimateContractGasReturnType}
   *
   * @example
   * import { createPublicClient, http, parseAbi } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const gas = await client.estimateContractGas({
   *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
   *   abi: parseAbi(['function mint() public']),
   *   functionName: 'mint',
   *   account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
   * })
   */
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
   * @param args - {@link EstimateGasParameters}
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
   * @param args - {@link GetBalanceParameters}
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
   * @param args - {@link GetBlockParameters}
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
   * @param args - {@link GetBlockNumberParameters}
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
   * @param args - {@link GetBlockTransactionCountParameters}
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
  /**
   * Retrieves the bytecode at an address.
   *
   * - Docs: https://viem.sh/docs/contract/getBytecode.html
   * - JSON-RPC Methods: [`eth_getCode`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getcode)
   *
   * @param args - {@link GetBytecodeParameters}
   * @returns The contract's bytecode. {@link GetBytecodeReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const code = await client.getBytecode({
   *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
   * })
   */
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
   * @param args - {@link GetEnsAddressParameters}
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
   * @param args - {@link GetEnsAvatarParameters}
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
   * @param args - {@link GetEnsNameParameters}
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
   * @param args - {@link GetEnsResolverParameters}
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
   * @param args - {@link GetEnsTextParameters}
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
   * @param args - {@link GetFeeHistoryParameters}
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
   * @param args - {@link GetFilterChangesParameters}
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
    TAbi extends Abi | readonly unknown[],
    TEventName extends string | undefined,
  >(
    args: GetFilterChangesParameters<TFilterType, TAbi, TEventName>,
  ) => Promise<GetFilterChangesReturnType<TFilterType, TAbi, TEventName>>
  /**
   * Returns a list of event logs since the filter was created.
   *
   * - Docs: https://viem.sh/docs/actions/public/getFilterLogs.html
   * - JSON-RPC Methods: [`eth_getFilterLogs`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getfilterlogs)
   *
   * @remarks
   * `getFilterLogs` is only compatible with **event filters**.
   *
   * @param args - {@link GetFilterLogsParameters}
   * @returns A list of event logs. {@link GetFilterLogsReturnType}
   *
   * @example
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
   * const logs = await client.getFilterLogs({ filter })
   */
  getFilterLogs: <
    TAbi extends Abi | readonly unknown[],
    TEventName extends string | undefined,
  >(
    args: GetFilterLogsParameters<TAbi, TEventName>,
  ) => Promise<GetFilterLogsReturnType<TAbi, TEventName>>
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
  /**
   * Returns a list of event logs matching the provided parameters.
   *
   * - Docs: https://viem.sh/docs/actions/public/getLogs.html
   * - Examples: https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/filters-and-logs/event-logs
   * - JSON-RPC Methods: [`eth_getLogs`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getlogs)
   *
   * @param args - {@link GetLogsParameters}
   * @returns A list of event logs. {@link GetLogsReturnType}
   *
   * @example
   * import { createPublicClient, http, parseAbiItem } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const logs = await client.getLogs()
   */
  getLogs: <TAbiEvent extends AbiEvent | undefined>(
    args?: GetLogsParameters<TAbiEvent>,
  ) => Promise<GetLogsReturnType<TAbiEvent>>
  /**
   * Returns the value from a storage slot at a given address.
   *
   * - Docs: https://viem.sh/docs/contract/getStorageAt.html
   * - JSON-RPC Methods: [`eth_getStorageAt`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getstorageat)
   *
   * @param args - {@link GetStorageAtParameters}
   * @returns The value of the storage slot. {@link GetStorageAtReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { getStorageAt } from 'viem/contract'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const code = await client.getStorageAt({
   *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
   *   slot: toHex(0),
   * })
   */
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
   * @param args - {@link GetTransactionParameters}
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
   * @param args - {@link GetTransactionConfirmationsParameters}
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
   * @param args - {@link GetTransactionCountParameters}
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
   * @param args - {@link GetTransactionReceiptParameters}
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
  /**
   * Similar to [`readContract`](https://viem.sh/docs/contract/readContract), but batches up multiple functions on a contract in a single RPC call via the [`multicall3` contract](https://github.com/mds1/multicall).
   *
   * - Docs: https://viem.sh/docs/contract/multicall.html
   *
   * @param args - {@link MulticallParameters}
   * @returns An array of results with accompanying status. {@link MulticallReturnType}
   *
   * @example
   * import { createPublicClient, http, parseAbi } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const abi = parseAbi([
   *   'function balanceOf(address) view returns (uint256)',
   *   'function totalSupply() view returns (uint256)',
   * ])
   * const result = await client.multicall({
   *   contracts: [
   *     {
   *       address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
   *       abi,
   *       functionName: 'balanceOf',
   *       args: ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e'],
   *     },
   *     {
   *       address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
   *       abi,
   *       functionName: 'totalSupply',
   *     },
   *   ],
   * })
   * // [{ result: 424122n, status: 'success' }, { result: 1000000n, status: 'success' }]
   */
  multicall: <
    TContracts extends ContractFunctionConfig[],
    TAllowFailure extends boolean = true,
  >(
    args: MulticallParameters<TContracts, TAllowFailure>,
  ) => Promise<MulticallReturnType<TContracts, TAllowFailure>>
  /**
   * Calls a read-only function on a contract, and returns the response.
   *
   * - Docs: https://viem.sh/docs/contract/readContract.html
   * - Examples: https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/contracts/reading-contracts
   *
   * @remarks
   * A "read-only" function (constant function) on a Solidity contract is denoted by a `view` or `pure` keyword. They can only read the state of the contract, and cannot make any changes to it. Since read-only methods do not change the state of the contract, they do not require any gas to be executed, and can be called by any user without the need to pay for gas.
   *
   * Internally, uses a [Public Client](https://viem.sh/docs/clients/public) to call the [`call` action](https://viem.sh/docs/actions/public/call) with [ABI-encoded `data`](https://viem.sh/docs/contract/encodeFunctionData).
   *
   * @param args - {@link ReadContractParameters}
   * @returns The response from the contract. Type is inferred. {@link ReadContractReturnType}
   *
   * @example
   * import { createPublicClient, http, parseAbi } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { readContract } from 'viem/contract'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const result = await client.readContract({
   *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
   *   abi: parseAbi(['function balanceOf(address) view returns (uint256)']),
   *   functionName: 'balanceOf',
   *   args: ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e'],
   * })
   * // 424122n
   */
  readContract: <
    TAbi extends Abi | readonly unknown[],
    TFunctionName extends string,
  >(
    args: ReadContractParameters<TAbi, TFunctionName>,
  ) => Promise<ReadContractReturnType<TAbi, TFunctionName>>
  /**
   * Simulates/validates a contract interaction. This is useful for retrieving **return data** and **revert reasons** of contract write functions.
   *
   * - Docs: https://viem.sh/docs/contract/simulateContract.html
   * - Examples: https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/contracts/writing-to-contracts
   *
   * @remarks
   * This function does not require gas to execute and _**does not**_ change the state of the blockchain. It is almost identical to [`readContract`](https://viem.sh/docs/contract/readContract), but also supports contract write functions.
   *
   * Internally, uses a [Public Client](https://viem.sh/docs/clients/public) to call the [`call` action](https://viem.sh/docs/actions/public/call) with [ABI-encoded `data`](https://viem.sh/docs/contract/encodeFunctionData).
   *
   * @param args - {@link SimulateContractParameters}
   * @returns The simulation result and write request. {@link SimulateContractReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const result = await client.simulateContract({
   *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
   *   abi: parseAbi(['function mint(uint32) view returns (uint32)']),
   *   functionName: 'mint',
   *   args: ['69420'],
   *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   * })
   */
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
  verifyMessage: (
    args: VerifyMessageParameters,
  ) => Promise<VerifyMessageReturnType>
  verifyTypedData: (
    args: VerifyTypedDataParameters,
  ) => Promise<VerifyTypedDataReturnType>
  /**
   * Destroys a Filter that was created from one of the following Actions:
   *
   * - [`createBlockFilter`](https://viem.sh/docs/actions/public/createBlockFilter)
   * - [`createEventFilter`](https://viem.sh/docs/actions/public/createEventFilter)
   * - [`createPendingTransactionFilter`](https://viem.sh/docs/actions/public/createPendingTransactionFilter)
   *
   * - Docs: https://viem.sh/docs/actions/public/uninstallFilter.html
   * - JSON-RPC Methods: [`eth_uninstallFilter`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_uninstallFilter)
   *
   * @param args - {@link UninstallFilterParameters}
   * @returns A boolean indicating if the Filter was successfully uninstalled. {@link UninstallFilterReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { createPendingTransactionFilter, uninstallFilter } from 'viem/public'
   *
   * const filter = await client.createPendingTransactionFilter()
   * const uninstalled = await client.uninstallFilter({ filter })
   * // true
   */
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
   * @param args - {@link WaitForTransactionReceiptParameters}
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
   * @param args - {@link WatchBlockNumberParameters}
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
   * @param args - {@link WatchBlocksParameters}
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
  /**
   * Watches and returns emitted contract event logs.
   *
   * - Docs: https://viem.sh/docs/contract/watchContractEvent.html
   *
   * @remarks
   * This Action will batch up all the event logs found within the [`pollingInterval`](https://viem.sh/docs/contract/watchContractEvent.html#pollinginterval-optional), and invoke them via [`onLogs`](https://viem.sh/docs/contract/watchContractEvent.html#onLogs).
   *
   * `watchContractEvent` will attempt to create an [Event Filter](https://viem.sh/docs/contract/createContractEventFilter) and listen to changes to the Filter per polling interval, however, if the RPC Provider does not support Filters (e.g. `eth_newFilter`), then `watchContractEvent` will fall back to using [`getLogs`](https://viem.sh/docs/actions/public/getLogs) instead.
   *
   * @param args - {@link WatchContractEventParameters}
   * @returns A function that can be invoked to stop watching for new event logs. {@link WatchContractEventReturnType}
   *
   * @example
   * import { createPublicClient, http, parseAbi } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const unwatch = client.watchContractEvent({
   *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
   *   abi: parseAbi(['event Transfer(address indexed from, address indexed to, uint256 value)']),
   *   eventName: 'Transfer',
   *   args: { from: '0xc961145a54C96E3aE9bAA048c4F4D6b04C13916b' },
   *   onLogs: (logs) => console.log(logs),
   * })
   */
  watchContractEvent: <
    TAbi extends Abi | readonly unknown[],
    TEventName extends string,
  >(
    args: WatchContractEventParameters<TAbi, TEventName>,
  ) => WatchContractEventReturnType
  /**
   * Watches and returns emitted [Event Logs](https://viem.sh/docs/glossary/terms#event-log).
   *
   * - Docs: https://viem.sh/docs/actions/public/watchEvent.html
   * - JSON-RPC Methods:
   *   - **RPC Provider supports `eth_newFilter`:**
   *     - Calls [`eth_newFilter`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_newfilter) to create a filter (called on initialize).
   *     - On a polling interval, it will call [`eth_getFilterChanges`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getfilterchanges).
   *   - **RPC Provider does not support `eth_newFilter`:**
   *     - Calls [`eth_getLogs`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getlogs) for each block between the polling interval.
   *
   * @remarks
   * This Action will batch up all the Event Logs found within the [`pollingInterval`](https://viem.sh/docs/actions/public/watchEvent.html#pollinginterval-optional), and invoke them via [`onLogs`](https://viem.sh/docs/actions/public/watchEvent.html#onLogs).
   *
   * `watchEvent` will attempt to create an [Event Filter](https://viem.sh/docs/actions/public/createEventFilter.html) and listen to changes to the Filter per polling interval, however, if the RPC Provider does not support Filters (e.g. `eth_newFilter`), then `watchEvent` will fall back to using [`getLogs`](https://viem.sh/docs/actions/public/getLogs) instead.
   *
   * @param args - {@link WatchEventParameters}
   * @returns A function that can be invoked to stop watching for new Event Logs. {@link WatchEventReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const unwatch = client.watchEvent({
   *   onLogs: (logs) => console.log(logs),
   * })
   */
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
   * @param args - {@link WatchPendingTransactionsParameters}
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
  verifyMessage: (args) => verifyMessage(client, args),
  verifyTypedData: (args) => verifyTypedData(client, args),
  uninstallFilter: (args) => uninstallFilter(client, args),
  waitForTransactionReceipt: (args) => waitForTransactionReceipt(client, args),
  watchBlocks: (args) => watchBlocks(client, args),
  watchBlockNumber: (args) => watchBlockNumber(client, args),
  watchContractEvent: (args) => watchContractEvent(client, args),
  watchEvent: (args) => watchEvent(client, args),
  watchPendingTransactions: (args) => watchPendingTransactions(client, args),
})
