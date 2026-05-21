import type * as RpcSchema from 'ox/RpcSchema'

import type * as Account from '../core/Account.js'
import type * as Chain from '../core/Chain.js'
import type * as Client from '../core/Client.js'
import type * as Transport from '../core/Transport.js'
import type * as Block from '../utils/Block.js'
import { createBlockFilter } from './public/createBlockFilter.js'
import { createEventFilter } from './public/createEventFilter.js'
import { createPendingTransactionFilter } from './public/createPendingTransactionFilter.js'
import { getBalance } from './public/getBalance.js'
import { getBlobBaseFee } from './public/getBlobBaseFee.js'
import { getBlock } from './public/getBlock.js'
import { getBlockNumber } from './public/getBlockNumber.js'
import { getBlockTransactionCount } from './public/getBlockTransactionCount.js'
import { getChainId } from './public/getChainId.js'
import { getCode } from './public/getCode.js'
import { getDelegation } from './public/getDelegation.js'
import { getFeeHistory } from './public/getFeeHistory.js'
import { getFilterChanges } from './public/getFilterChanges.js'
import { getFilterLogs } from './public/getFilterLogs.js'
import { getGasPrice } from './public/getGasPrice.js'
import { getLogs } from './public/getLogs.js'
import { getProof } from './public/getProof.js'
import { getStorageAt } from './public/getStorageAt.js'
import { getTransaction } from './public/getTransaction.js'
import { getTransactionConfirmations } from './public/getTransactionConfirmations.js'
import { getTransactionCount } from './public/getTransactionCount.js'
import { getTransactionReceipt } from './public/getTransactionReceipt.js'
import { uninstallFilter } from './public/uninstallFilter.js'

/** Public action methods attached by `publicActions`. */
export type PublicActions = {
  /**
   * Creates a filter to listen for new block hashes.
   *
   * @example
   * ```ts twoslash
   * import { Client, http, publicActions } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = Client.create({
   *   chain: mainnet,
   *   transport: http()
   * }).extend(publicActions())
   *
   * const filterId = await client.public.createBlockFilter()
   * ```
   *
   * @returns Filter identifier.
   */
  createBlockFilter: () => createBlockFilter.ReturnType
  /**
   * Creates a filter to listen for event logs.
   *
   * @example
   * ```ts twoslash
   * import { Client, http, publicActions } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = Client.create({
   *   chain: mainnet,
   *   transport: http()
   * }).extend(publicActions())
   *
   * const filterId = await client.public.createEventFilter({
   *   address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
   * })
   * ```
   *
   * @param options - Options.
   * @returns Filter identifier.
   */
  createEventFilter: (
    options?: createEventFilter.Options | undefined,
  ) => createEventFilter.ReturnType
  /**
   * Creates a filter to listen for new pending transaction hashes.
   *
   * @example
   * ```ts twoslash
   * import { Client, http, publicActions } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = Client.create({
   *   chain: mainnet,
   *   transport: http()
   * }).extend(publicActions())
   *
   * const filterId =
   *   await client.public.createPendingTransactionFilter()
   * ```
   *
   * @returns Filter identifier.
   */
  createPendingTransactionFilter: () => createPendingTransactionFilter.ReturnType
  /**
   * Returns the balance of an address in wei.
   *
   * @example
   * ```ts twoslash
   * import { Client, http, publicActions } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = Client.create({
   *   chain: mainnet,
   *   transport: http()
   * }).extend(publicActions())
   *
   * const balance = await client.public.getBalance({
   *   address: '0x0000000000000000000000000000000000000000'
   * })
   * ```
   *
   * @param options - Options.
   * @returns Balance in wei.
   */
  getBalance: (options: getBalance.Options) => getBalance.ReturnType
  /**
   * Returns the current blob base fee.
   *
   * @example
   * ```ts twoslash
   * import { Client, http, publicActions } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = Client.create({
   *   chain: mainnet,
   *   transport: http()
   * }).extend(publicActions())
   *
   * const blobBaseFee = await client.public.getBlobBaseFee()
   * ```
   *
   * @returns Blob base fee.
   */
  getBlobBaseFee: () => getBlobBaseFee.ReturnType
  /**
   * Returns information about a block at a block number, hash, or tag.
   *
   * @example
   * ```ts twoslash
   * import { Client, http, publicActions } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = Client.create({
   *   chain: mainnet,
   *   transport: http()
   * }).extend(publicActions())
   *
   * const block = await client.public.getBlock()
   * ```
   *
   * @param options - Options.
   * @returns Block.
   */
  getBlock: <
    includeTransactions extends boolean = false,
    blockTag extends Block.Tag = 'latest',
  >(
    options?: getBlock.Options<includeTransactions, blockTag> | undefined,
  ) => getBlock.ReturnType<includeTransactions, blockTag>
  /**
   * Returns the number of the most recent block.
   *
   * @example
   * ```ts twoslash
   * import { Client, http, publicActions } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = Client.create({
   *   chain: mainnet,
   *   transport: http()
   * }).extend(publicActions())
   *
   * const blockNumber = await client.public.getBlockNumber()
   * ```
   *
   * @param options - Options.
   * @returns Block number.
   */
  getBlockNumber: (
    options?: getBlockNumber.Options | undefined,
  ) => getBlockNumber.ReturnType
  /**
   * Returns the number of transactions in a block.
   *
   * @example
   * ```ts twoslash
   * import { Client, http, publicActions } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = Client.create({
   *   chain: mainnet,
   *   transport: http()
   * }).extend(publicActions())
   *
   * const count = await client.public.getBlockTransactionCount()
   * ```
   *
   * @param options - Options.
   * @returns Block transaction count.
   */
  getBlockTransactionCount: (
    options?: getBlockTransactionCount.Options | undefined,
  ) => getBlockTransactionCount.ReturnType
  /**
   * Returns the client chain ID.
   *
   * @example
   * ```ts twoslash
   * import { Client, http, publicActions } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = Client.create({
   *   chain: mainnet,
   *   transport: http()
   * }).extend(publicActions())
   *
   * const chainId = await client.public.getChainId()
   * ```
   *
   * @returns Chain ID.
   */
  getChainId: () => getChainId.ReturnType
  /**
   * Returns the bytecode at an address.
   *
   * @example
   * ```ts twoslash
   * import { Client, http, publicActions } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = Client.create({
   *   chain: mainnet,
   *   transport: http()
   * }).extend(publicActions())
   *
   * const code = await client.public.getCode({
   *   address: '0x0000000000000000000000000000000000000000'
   * })
   * ```
   *
   * @param options - Options.
   * @returns Bytecode, if found.
   */
  getCode: (options: getCode.Options) => getCode.ReturnType
  /**
   * Returns the address that an account has delegated to via EIP-7702.
   *
   * @example
   * ```ts twoslash
   * import { Client, http, publicActions } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = Client.create({
   *   chain: mainnet,
   *   transport: http()
   * }).extend(publicActions())
   *
   * const delegation = await client.public.getDelegation({
   *   address: '0x0000000000000000000000000000000000000000'
   * })
   * ```
   *
   * @param options - Options.
   * @returns Delegated address or `undefined`.
   */
  getDelegation: (options: getDelegation.Options) => getDelegation.ReturnType
  /**
   * Returns a collection of historical gas information.
   *
   * @example
   * ```ts twoslash
   * import { Client, http, publicActions } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = Client.create({
   *   chain: mainnet,
   *   transport: http()
   * }).extend(publicActions())
   *
   * const feeHistory = await client.public.getFeeHistory({
   *   blockCount: 4,
   *   rewardPercentiles: [25, 75]
   * })
   * ```
   *
   * @param options - Options.
   * @returns Fee history.
   */
  getFeeHistory: (options: getFeeHistory.Options) => getFeeHistory.ReturnType
  /**
   * Returns logs or hashes accumulated by a filter since the last poll.
   *
   * @example
   * ```ts twoslash
   * import { Client, http, publicActions } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = Client.create({
   *   chain: mainnet,
   *   transport: http()
   * }).extend(publicActions())
   *
   * const filterId = await client.public.createBlockFilter()
   * const changes = await client.public.getFilterChanges({
   *   filterId
   * })
   * ```
   *
   * @param options - Options.
   * @returns Logs or hashes since the last poll.
   */
  getFilterChanges: (
    options: getFilterChanges.Options,
  ) => getFilterChanges.ReturnType
  /**
   * Returns the full list of logs matching an event filter.
   *
   * @example
   * ```ts twoslash
   * import { Client, http, publicActions } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = Client.create({
   *   chain: mainnet,
   *   transport: http()
   * }).extend(publicActions())
   *
   * const filterId = await client.public.createEventFilter()
   * const logs = await client.public.getFilterLogs({ filterId })
   * ```
   *
   * @param options - Options.
   * @returns Event logs.
   */
  getFilterLogs: (options: getFilterLogs.Options) => getFilterLogs.ReturnType
  /**
   * Returns the current gas price.
   *
   * @example
   * ```ts twoslash
   * import { Client, http, publicActions } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = Client.create({
   *   chain: mainnet,
   *   transport: http()
   * }).extend(publicActions())
   *
   * const gasPrice = await client.public.getGasPrice()
   * ```
   *
   * @returns Gas price.
   */
  getGasPrice: () => getGasPrice.ReturnType
  /**
   * Returns a list of event logs matching the provided filter.
   *
   * @example
   * ```ts twoslash
   * import { Client, http, publicActions } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = Client.create({
   *   chain: mainnet,
   *   transport: http()
   * }).extend(publicActions())
   *
   * const logs = await client.public.getLogs()
   * ```
   *
   * @param options - Options.
   * @returns Event logs.
   */
  getLogs: (options?: getLogs.Options | undefined) => getLogs.ReturnType
  /**
   * Returns the account and storage values of the specified account
   * including the Merkle proof.
   *
   * @example
   * ```ts twoslash
   * import { Client, http, publicActions } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = Client.create({
   *   chain: mainnet,
   *   transport: http()
   * }).extend(publicActions())
   *
   * const proof = await client.public.getProof({
   *   address: '0x0000000000000000000000000000000000000000',
   *   storageKeys: [
   *     '0x0000000000000000000000000000000000000000000000000000000000000000'
   *   ]
   * })
   * ```
   *
   * @param options - Options.
   * @returns Account proof.
   */
  getProof: (options: getProof.Options) => getProof.ReturnType
  /**
   * Returns the value from a storage slot at an address.
   *
   * @example
   * ```ts twoslash
   * import { Client, http, publicActions } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = Client.create({
   *   chain: mainnet,
   *   transport: http()
   * }).extend(publicActions())
   *
   * const value = await client.public.getStorageAt({
   *   address: '0x0000000000000000000000000000000000000000',
   *   slot: '0x0'
   * })
   * ```
   *
   * @param options - Options.
   * @returns Storage value.
   */
  getStorageAt: (options: getStorageAt.Options) => getStorageAt.ReturnType
  /**
   * Returns information about a transaction given a hash or block identifier.
   *
   * @example
   * ```ts twoslash
   * import { Client, http, publicActions } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = Client.create({
   *   chain: mainnet,
   *   transport: http()
   * }).extend(publicActions())
   *
   * const transaction = await client.public.getTransaction({
   *   hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d'
   * })
   * ```
   *
   * @param options - Options.
   * @returns Transaction.
   */
  getTransaction: (options: getTransaction.Options) => getTransaction.ReturnType
  /**
   * Returns the number of blocks elapsed since a transaction was mined.
   *
   * @example
   * ```ts twoslash
   * import { Client, http, publicActions } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = Client.create({
   *   chain: mainnet,
   *   transport: http()
   * }).extend(publicActions())
   *
   * const confirmations =
   *   await client.public.getTransactionConfirmations({
   *     hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d'
   *   })
   * ```
   *
   * @param options - Options.
   * @returns Number of confirmations.
   */
  getTransactionConfirmations: (
    options: getTransactionConfirmations.Options,
  ) => getTransactionConfirmations.ReturnType
  /**
   * Returns the number of transactions sent from an address.
   *
   * @example
   * ```ts twoslash
   * import { Client, http, publicActions } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = Client.create({
   *   chain: mainnet,
   *   transport: http()
   * }).extend(publicActions())
   *
   * const count = await client.public.getTransactionCount({
   *   address: '0x0000000000000000000000000000000000000000'
   * })
   * ```
   *
   * @param options - Options.
   * @returns Transaction count.
   */
  getTransactionCount: (
    options: getTransactionCount.Options,
  ) => getTransactionCount.ReturnType
  /**
   * Returns the receipt for a given transaction hash.
   *
   * @example
   * ```ts twoslash
   * import { Client, http, publicActions } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = Client.create({
   *   chain: mainnet,
   *   transport: http()
   * }).extend(publicActions())
   *
   * const receipt = await client.public.getTransactionReceipt({
   *   hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d'
   * })
   * ```
   *
   * @param options - Options.
   * @returns Transaction receipt.
   */
  getTransactionReceipt: (
    options: getTransactionReceipt.Options,
  ) => getTransactionReceipt.ReturnType
  /**
   * Uninstalls a filter previously created by `createBlockFilter`,
   * `createEventFilter`, or `createPendingTransactionFilter`.
   *
   * @example
   * ```ts twoslash
   * import { Client, http, publicActions } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = Client.create({
   *   chain: mainnet,
   *   transport: http()
   * }).extend(publicActions())
   *
   * const filterId = await client.public.createBlockFilter()
   * const uninstalled = await client.public.uninstallFilter({
   *   filterId
   * })
   * ```
   *
   * @param options - Options.
   * @returns `true` if the filter was uninstalled, `false` otherwise.
   */
  uninstallFilter: (
    options: uninstallFilter.Options,
  ) => uninstallFilter.ReturnType
}

/**
 * Creates a public action decorator.
 *
 * @example
 * ```ts twoslash
 * import { Client, http, publicActions } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http()
 * }).extend(publicActions())
 *
 * const blockNumber = await client.public.getBlockNumber()
 * ```
 *
 * @returns Client decorator.
 */
export function publicActions() {
  return <
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
    account extends Account.Account | undefined = Account.Account | undefined,
    transport extends Transport.Transport = Transport.Transport,
    schema extends RpcSchema.Generic | undefined = undefined,
  >(
    client: Client.Client<chain, account, transport, schema>,
  ) => {
    const actionClient = client as unknown as Client.Client<chain>
    const actions: PublicActions = {
      createBlockFilter: () => createBlockFilter(actionClient),
      createEventFilter: (options?: createEventFilter.Options | undefined) =>
        createEventFilter(actionClient, options),
      createPendingTransactionFilter: () =>
        createPendingTransactionFilter(actionClient),
      getBalance: (options: getBalance.Options) =>
        getBalance(actionClient, options),
      getBlobBaseFee: () => getBlobBaseFee(actionClient),
      getBlock: <
        includeTransactions extends boolean = false,
        blockTag extends Block.Tag = 'latest',
      >(
        options?: getBlock.Options<includeTransactions, blockTag> | undefined,
      ) => getBlock(actionClient, options),
      getBlockNumber: (options?: getBlockNumber.Options | undefined) =>
        getBlockNumber(actionClient, options),
      getBlockTransactionCount: (
        options?: getBlockTransactionCount.Options | undefined,
      ) => getBlockTransactionCount(actionClient, options),
      getChainId: () => getChainId(actionClient),
      getCode: (options: getCode.Options) => getCode(actionClient, options),
      getDelegation: (options: getDelegation.Options) =>
        getDelegation(actionClient, options),
      getFeeHistory: (options: getFeeHistory.Options) =>
        getFeeHistory(actionClient, options),
      getFilterChanges: (options: getFilterChanges.Options) =>
        getFilterChanges(actionClient, options),
      getFilterLogs: (options: getFilterLogs.Options) =>
        getFilterLogs(actionClient, options),
      getGasPrice: () => getGasPrice(actionClient),
      getLogs: (options?: getLogs.Options | undefined) =>
        getLogs(actionClient, options),
      getProof: (options: getProof.Options) => getProof(actionClient, options),
      getStorageAt: (options: getStorageAt.Options) =>
        getStorageAt(actionClient, options),
      getTransaction: (options: getTransaction.Options) =>
        getTransaction(actionClient, options),
      getTransactionConfirmations: (
        options: getTransactionConfirmations.Options,
      ) => getTransactionConfirmations(actionClient, options),
      getTransactionCount: (options: getTransactionCount.Options) =>
        getTransactionCount(actionClient, options),
      getTransactionReceipt: (options: getTransactionReceipt.Options) =>
        getTransactionReceipt(actionClient, options),
      uninstallFilter: (options: uninstallFilter.Options) =>
        uninstallFilter(actionClient, options),
    }

    return { public: actions }
  }
}

export {
  createBlockFilter,
  createEventFilter,
  createPendingTransactionFilter,
  getBalance,
  getBlobBaseFee,
  getBlock,
  getBlockNumber,
  getBlockTransactionCount,
  getChainId,
  getCode,
  getDelegation,
  getFeeHistory,
  getFilterChanges,
  getFilterLogs,
  getGasPrice,
  getLogs,
  getProof,
  getStorageAt,
  getTransaction,
  getTransactionConfirmations,
  getTransactionCount,
  getTransactionReceipt,
  uninstallFilter,
}
