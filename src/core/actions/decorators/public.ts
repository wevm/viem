import type { Abi } from 'abitype'
import type * as Block from 'ox/Block'

import type * as Chain from '../../Chain.js'
import type * as Client from '../../Client.js'
import type {
  ContractFunctionArgs,
  ContractFunctionName,
} from '../internal/contract.js'
import { call } from '../public/call.js'
import { estimateMaxPriorityFeePerGas } from '../public/estimateMaxPriorityFeePerGas.js'
import { getBalance } from '../public/getBalance.js'
import { getBlobBaseFee } from '../public/getBlobBaseFee.js'
import { getBlock } from '../public/getBlock.js'
import { getBlockNumber } from '../public/getBlockNumber.js'
import { getBlockReceipts } from '../public/getBlockReceipts.js'
import { getBlockTransactionCount } from '../public/getBlockTransactionCount.js'
import { getChainId } from '../public/getChainId.js'
import { getCode } from '../public/getCode.js'
import { getDelegation } from '../public/getDelegation.js'
import { getEip712Domain } from '../public/getEip712Domain.js'
import { getFeeHistory } from '../public/getFeeHistory.js'
import { getGasPrice } from '../public/getGasPrice.js'
import { getProof } from '../public/getProof.js'
import { getStorageAt } from '../public/getStorageAt.js'
import { getTransaction } from '../public/getTransaction.js'
import { getTransactionConfirmations } from '../public/getTransactionConfirmations.js'
import { getTransactionCount } from '../public/getTransactionCount.js'
import { getTransactionReceipt } from '../public/getTransactionReceipt.js'
import { readContract } from '../public/readContract.js'

/**
 * Bag of public actions bound to a {@link Client}. Pass to `Client.create`'s
 * `.extend`.
 *
 * @example
 * ```ts
 * import { Client, http, publicActions } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http(),
 * }).extend(publicActions())
 * const blockNumber = await client.getBlockNumber()
 * ```
 */
export function publicActions() {
  return <chain extends Chain.Chain | undefined>(
    client: Client.Client<chain>,
  ): publicActions.Decorator<chain> => ({
    call: (options) => call(client, options),
    estimateMaxPriorityFeePerGas: (options) =>
      estimateMaxPriorityFeePerGas(client, options),
    getBalance: (options) => getBalance(client, options),
    getBlobBaseFee: () => getBlobBaseFee(client),
    getBlock: (options) => getBlock(client, options),
    getBlockNumber: (options) => getBlockNumber(client, options),
    getBlockReceipts: (options) => getBlockReceipts(client, options),
    getBlockTransactionCount: (options) =>
      getBlockTransactionCount(client, options),
    getChainId: () => getChainId(client),
    getCode: (options) => getCode(client, options),
    getDelegation: (options) => getDelegation(client, options),
    getEip712Domain: (options) => getEip712Domain(client, options),
    getFeeHistory: (options) => getFeeHistory(client, options),
    getGasPrice: () => getGasPrice(client),
    getProof: (options) => getProof(client, options),
    getStorageAt: (options) => getStorageAt(client, options),
    getTransaction: (options) => getTransaction(client, options),
    getTransactionConfirmations: (options) =>
      getTransactionConfirmations(client, options),
    getTransactionCount: (options) => getTransactionCount(client, options),
    getTransactionReceipt: (options) => getTransactionReceipt(client, options),
    readContract: (options) => readContract(client, options),
  })
}

export declare namespace publicActions {
  type Decorator<
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
  > = {
    /**
     * Executes a new message call without submitting a transaction to the
     * network (`eth_call`).
     *
     * @example
     * ```ts
     * import { Client, http, publicActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(publicActions())
     * const { data } = await client.call({
     *   data: '0x06fdde03',
     *   to: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
     * })
     * ```
     */
    call: (options?: call.Options | undefined) => Promise<call.ReturnType>
    /**
     * Returns an estimate for the max priority fee per gas (in wei) for a
     * transaction to be likely included in the next block.
     *
     * @example
     * ```ts
     * import { Client, http, publicActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(publicActions())
     * const maxPriorityFeePerGas = await client.estimateMaxPriorityFeePerGas()
     * ```
     */
    estimateMaxPriorityFeePerGas: (
      options?: estimateMaxPriorityFeePerGas.Options | undefined,
    ) => Promise<estimateMaxPriorityFeePerGas.ReturnType>
    /**
     * Returns the balance of an address in wei.
     *
     * @example
     * ```ts
     * import { Client, http, publicActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(publicActions())
     * const balance = await client.getBalance({
     *   address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
     * })
     * ```
     */
    getBalance: (options: getBalance.Options) => Promise<getBalance.ReturnType>
    /**
     * Returns the base fee per blob gas (in wei).
     *
     * @example
     * ```ts
     * import { Client, http, publicActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(publicActions())
     * const blobBaseFee = await client.getBlobBaseFee()
     * ```
     */
    getBlobBaseFee: () => Promise<getBlobBaseFee.ReturnType>
    /**
     * Returns information about a block at a block number, hash, or tag.
     *
     * @example
     * ```ts
     * import { Client, http, publicActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(publicActions())
     * const block = await client.getBlock()
     * ```
     */
    getBlock: <
      includeTransactions extends boolean = false,
      blockTag extends Block.Tag = 'latest',
    >(
      options?: getBlock.Options<includeTransactions, blockTag> | undefined,
    ) => Promise<getBlock.ReturnType<chain, includeTransactions, blockTag>>
    /**
     * Returns the number of the most recent block seen.
     *
     * @example
     * ```ts
     * import { Client, http, publicActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(publicActions())
     * const blockNumber = await client.getBlockNumber()
     * ```
     */
    getBlockNumber: (
      options?: getBlockNumber.Options | undefined,
    ) => Promise<getBlockNumber.ReturnType>
    /**
     * Returns the transaction receipts of a block at a block number, hash, or
     * tag.
     *
     * @example
     * ```ts
     * import { Client, http, publicActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(publicActions())
     * const receipts = await client.getBlockReceipts({ blockNumber: 69420n })
     * ```
     */
    getBlockReceipts: (
      options?: getBlockReceipts.Options | undefined,
    ) => Promise<getBlockReceipts.ReturnType<chain>>
    /**
     * Returns the number of transactions at a block number, hash, or tag.
     *
     * @example
     * ```ts
     * import { Client, http, publicActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(publicActions())
     * const count = await client.getBlockTransactionCount()
     * ```
     */
    getBlockTransactionCount: (
      options?: getBlockTransactionCount.Options | undefined,
    ) => Promise<getBlockTransactionCount.ReturnType>
    /**
     * Returns the chain ID associated with the current network.
     *
     * @example
     * ```ts
     * import { Client, http, publicActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(publicActions())
     * const chainId = await client.getChainId()
     * ```
     */
    getChainId: () => Promise<getChainId.ReturnType>
    /**
     * Retrieves the bytecode at an address.
     *
     * @example
     * ```ts
     * import { Client, http, publicActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(publicActions())
     * const code = await client.getCode({
     *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
     * })
     * ```
     */
    getCode: (options: getCode.Options) => Promise<getCode.ReturnType>
    /**
     * Returns the address that an account has delegated to via EIP-7702.
     *
     * @example
     * ```ts
     * import { Client, http, publicActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(publicActions())
     * const delegation = await client.getDelegation({
     *   address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
     * })
     * ```
     */
    getDelegation: (
      options: getDelegation.Options,
    ) => Promise<getDelegation.ReturnType>
    /**
     * Reads the EIP-712 domain from a contract, based on the ERC-5267
     * specification.
     *
     * @example
     * ```ts
     * import { Client, http, publicActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(publicActions())
     * const { domain, extensions, fields } = await client.getEip712Domain({
     *   address: '0x57ba3ec8df619d4d243ce439551cce713bb17411',
     * })
     * ```
     */
    getEip712Domain: (
      options: getEip712Domain.Options,
    ) => Promise<getEip712Domain.ReturnType>
    /**
     * Returns a collection of historical gas information.
     *
     * @example
     * ```ts
     * import { Client, http, publicActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(publicActions())
     * const feeHistory = await client.getFeeHistory({
     *   blockCount: 4,
     *   rewardPercentiles: [25, 75],
     * })
     * ```
     */
    getFeeHistory: (
      options: getFeeHistory.Options,
    ) => Promise<getFeeHistory.ReturnType>
    /**
     * Returns the current price of gas (in wei).
     *
     * @example
     * ```ts
     * import { Client, http, publicActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(publicActions())
     * const gasPrice = await client.getGasPrice()
     * ```
     */
    getGasPrice: () => Promise<getGasPrice.ReturnType>
    /**
     * Returns the account and storage values of the specified account,
     * including the Merkle proof.
     *
     * @example
     * ```ts
     * import { Client, http, publicActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(publicActions())
     * const proof = await client.getProof({
     *   address: '0x4200000000000000000000000000000000000016',
     *   storageKeys: [
     *     '0x4a932049252365b3eedbc5190e18949f2ec11f39d3bef2d259764799a1b27d99',
     *   ],
     * })
     * ```
     */
    getProof: (options: getProof.Options) => Promise<getProof.ReturnType>
    /**
     * Returns the value from a storage slot at a given address.
     *
     * @example
     * ```ts
     * import { Client, http, publicActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(publicActions())
     * const value = await client.getStorageAt({
     *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
     *   slot: '0x0',
     * })
     * ```
     */
    getStorageAt: (
      options: getStorageAt.Options,
    ) => Promise<getStorageAt.ReturnType>
    /**
     * Returns information about a transaction given a hash or block identifier.
     *
     * @example
     * ```ts
     * import { Client, http, publicActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(publicActions())
     * const transaction = await client.getTransaction({
     *   hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
     * })
     * ```
     */
    getTransaction: <blockTag extends Block.Tag = 'latest'>(
      options: getTransaction.Options<blockTag>,
    ) => Promise<getTransaction.ReturnType<chain, blockTag>>
    /**
     * Returns the number of blocks passed (confirmations) since the transaction
     * was processed on a block.
     *
     * @example
     * ```ts
     * import { Client, http, publicActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(publicActions())
     * const confirmations = await client.getTransactionConfirmations({
     *   hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
     * })
     * ```
     */
    getTransactionConfirmations: (
      options: getTransactionConfirmations.Options<chain>,
    ) => Promise<getTransactionConfirmations.ReturnType>
    /**
     * Returns the number of transactions an Account has broadcast / sent.
     *
     * @example
     * ```ts
     * import { Client, http, publicActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(publicActions())
     * const count = await client.getTransactionCount({
     *   address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
     * })
     * ```
     */
    getTransactionCount: (
      options: getTransactionCount.Options,
    ) => Promise<getTransactionCount.ReturnType>
    /**
     * Returns the transaction receipt for a given transaction hash.
     *
     * @example
     * ```ts
     * import { Client, http, publicActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(publicActions())
     * const receipt = await client.getTransactionReceipt({
     *   hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
     * })
     * ```
     */
    getTransactionReceipt: (
      options: getTransactionReceipt.Options,
    ) => Promise<getTransactionReceipt.ReturnType<chain>>
    /**
     * Calls a read-only (`pure`/`view`) function on a contract and returns the
     * decoded response.
     *
     * @example
     * ```ts
     * import { Client, http, publicActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     * import { Abi } from 'viem/utils'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(publicActions())
     * const balance = await client.readContract({
     *   abi: Abi.from(['function balanceOf(address) view returns (uint256)']),
     *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
     *   args: ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e'],
     *   functionName: 'balanceOf',
     * })
     * ```
     */
    readContract: <
      const abi extends Abi | readonly unknown[],
      functionName extends ContractFunctionName<abi, 'pure' | 'view'>,
      const args extends ContractFunctionArgs<
        abi,
        'pure' | 'view',
        functionName
      >,
    >(
      options: readContract.Options<abi, functionName, args>,
    ) => Promise<readContract.ReturnType<abi, functionName, args>>
  }
}
