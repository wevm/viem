import type { Abi } from 'abitype'
import type * as AbiEvent from 'ox/AbiEvent'
import type * as Block from 'ox/Block'
import type * as Fee from 'ox/Fee'

import type * as Account from '../../Account.js'
import type * as Chain from '../../Chain.js'
import type * as Client from '../../Client.js'
import type {
  ContractFunctionArgs,
  ContractFunctionName,
} from '../internal/contract.js'
import * as address from '../public/address/index.js'
import * as block from '../public/block/index.js'
import { call } from '../public/call.js'
import * as chains from '../public/chains/index.js'
import * as contract from '../public/contract/index.js'
import * as logs from '../public/logs/index.js'
import * as fee from '../public/fee/index.js'
import * as transaction from '../public/transaction/index.js'

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
 * const blockNumber = await client.block.getNumber()
 * ```
 */
export function publicActions() {
  return <
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
  ): publicActions.Decorator<chain, account> => ({
    address: {
      getBalance: (options) => address.getBalance(client, options),
      getCode: (options) => address.getCode(client, options),
      getDelegation: (options) => address.getDelegation(client, options),
      getProof: (options) => address.getProof(client, options),
      getStorageAt: (options) => address.getStorageAt(client, options),
      getTransactionCount: (options) =>
        address.getTransactionCount(client, options),
    },
    block: {
      get: (options) => block.get(client, options),
      getNumber: (options) => block.getNumber(client, options),
      getReceipts: (options) => block.getReceipts(client, options),
      getTransactionCount: (options) =>
        block.getTransactionCount(client, options),
      watchNumber: (options) => block.watchNumber(client, options),
    },
    call: (options) => call(client, options),
    chains: {
      getId: () => chains.getId(client),
    },
    contract: {
      getEip712Domain: (options) => contract.getEip712Domain(client, options),
      getLogs: (options) => contract.getLogs(client, options as never),
      read: (options) => contract.read(client, options),
      write: (options) => contract.write(client, options as never),
    },
    logs: {
      get: (options) => logs.get(client, options as never),
    },
    fee: {
      estimateFeesPerGas: (options) => fee.estimateFeesPerGas(client, options),
      estimateMaxPriorityFeePerGas: (options) =>
        fee.estimateMaxPriorityFeePerGas(client, options),
      getBlobBaseFee: () => fee.getBlobBaseFee(client),
      getGasPrice: () => fee.getGasPrice(client),
      getHistory: (options) => fee.getHistory(client, options),
    },
    transaction: {
      estimateGas: (options) => transaction.estimateGas(client, options),
      fill: (options) => transaction.fill(client, options),
      get: (options) => transaction.get(client, options),
      getConfirmations: (options) =>
        transaction.getConfirmations(client, options),
      getReceipt: (options) => transaction.getReceipt(client, options),
      prepare: (options) => transaction.prepare(client, options),
      send: (options) => transaction.send(client, options),
      sendRaw: (options) => transaction.sendRaw(client, options),
      sign: (options) => transaction.sign(client, options),
      waitForReceipt: (options) => transaction.waitForReceipt(client, options),
    },
  })
}

export declare namespace publicActions {
  type Decorator<
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
    account extends Account.Account | undefined = Account.Account | undefined,
  > = {
    address: {
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
       * const balance = await client.address.getBalance({
       *   address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
       * })
       * ```
       */
      getBalance: (
        options: address.getBalance.Options,
      ) => Promise<address.getBalance.ReturnType>
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
       * const code = await client.address.getCode({
       *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
       * })
       * ```
       */
      getCode: (
        options: address.getCode.Options,
      ) => Promise<address.getCode.ReturnType>
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
       * const delegation = await client.address.getDelegation({
       *   address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
       * })
       * ```
       */
      getDelegation: (
        options: address.getDelegation.Options,
      ) => Promise<address.getDelegation.ReturnType>
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
       * const proof = await client.address.getProof({
       *   address: '0x4200000000000000000000000000000000000016',
       *   storageKeys: [
       *     '0x4a932049252365b3eedbc5190e18949f2ec11f39d3bef2d259764799a1b27d99',
       *   ],
       * })
       * ```
       */
      getProof: (
        options: address.getProof.Options,
      ) => Promise<address.getProof.ReturnType>
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
       * const value = await client.address.getStorageAt({
       *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
       *   slot: '0x0',
       * })
       * ```
       */
      getStorageAt: (
        options: address.getStorageAt.Options,
      ) => Promise<address.getStorageAt.ReturnType>
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
       * const count = await client.address.getTransactionCount({
       *   address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
       * })
       * ```
       */
      getTransactionCount: (
        options: address.getTransactionCount.Options,
      ) => Promise<address.getTransactionCount.ReturnType>
    }
    block: {
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
       * const block = await client.block.get()
       * ```
       */
      get: <
        includeTransactions extends boolean = false,
        blockTag extends Block.Tag = 'latest',
      >(
        options?: block.get.Options<includeTransactions, blockTag> | undefined,
      ) => Promise<block.get.ReturnType<chain, includeTransactions, blockTag>>
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
       * const blockNumber = await client.block.getNumber()
       * ```
       */
      getNumber: (
        options?: block.getNumber.Options | undefined,
      ) => Promise<block.getNumber.ReturnType>
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
       * const receipts = await client.block.getReceipts({ blockNumber: 69420n })
       * ```
       */
      getReceipts: (
        options?: block.getReceipts.Options | undefined,
      ) => Promise<block.getReceipts.ReturnType<chain>>
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
       * const count = await client.block.getTransactionCount()
       * ```
       */
      getTransactionCount: (
        options?: block.getTransactionCount.Options | undefined,
      ) => Promise<block.getTransactionCount.ReturnType>
      /**
       * Watches incoming block numbers, returning a watcher handle.
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
       *
       * const watch = client.block.watchNumber()
       * watch.onBlockNumber((blockNumber) => console.log(blockNumber))
       * // later: watch.off()
       * ```
       */
      watchNumber: (
        options?: block.watchNumber.Options | undefined,
      ) => block.watchNumber.Watcher
    }
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
    chains: {
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
       * const chainId = await client.chains.getId()
       * ```
       */
      getId: () => Promise<chains.getId.ReturnType>
    }
    contract: {
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
       * const { domain, extensions, fields } = await client.contract.getEip712Domain({
       *   address: '0x57ba3ec8df619d4d243ce439551cce713bb17411',
       * })
       * ```
       */
      getEip712Domain: (
        options: contract.getEip712Domain.Options,
      ) => Promise<contract.getEip712Domain.ReturnType>
      /**
       * Returns a list of event logs emitted by a contract.
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
       * const logs = await client.contract.getLogs({
       *   abi: Abi.from([
       *     'event Transfer(address indexed from, address indexed to, uint256 value)',
       *   ]),
       *   eventName: 'Transfer',
       * })
       * ```
       */
      getLogs: <
        const abi extends Abi | readonly unknown[],
        eventName extends AbiEvent.extractLogs.EventName<abi> | undefined =
          undefined,
        strict extends boolean | undefined = undefined,
        fromBlock extends Block.Number | Block.Tag | undefined = undefined,
        toBlock extends Block.Number | Block.Tag | undefined = undefined,
      >(
        options: contract.getLogs.Options<
          abi,
          eventName,
          strict,
          fromBlock,
          toBlock
        >,
      ) => Promise<
        contract.getLogs.ReturnType<abi, eventName, strict, fromBlock, toBlock>
      >
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
       * const balance = await client.contract.read({
       *   abi: Abi.from(['function balanceOf(address) view returns (uint256)']),
       *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
       *   args: ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e'],
       *   functionName: 'balanceOf',
       * })
       * ```
       */
      read: <
        const abi extends Abi | readonly unknown[],
        functionName extends ContractFunctionName<abi, 'pure' | 'view'>,
        const args extends ContractFunctionArgs<
          abi,
          'pure' | 'view',
          functionName
        >,
      >(
        options: contract.read.Options<abi, functionName, args>,
      ) => Promise<contract.read.ReturnType<abi, functionName, args>>
      /**
       * Executes a write (`nonpayable`/`payable`) function on a contract.
       *
       * @example
       * ```ts
       * import { Account, Client, http, publicActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       * import { Abi } from 'viem/utils'
       *
       * const client = Client.create({
       *   account: Account.fromPrivateKey('0x…'),
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(publicActions())
       * const hash = await client.contract.write({
       *   abi: Abi.from(['function mint(uint32 tokenId)']),
       *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
       *   args: [69420],
       *   functionName: 'mint',
       * })
       * ```
       */
      write: <
        const abi extends Abi | readonly unknown[],
        functionName extends ContractFunctionName<
          abi,
          'nonpayable' | 'payable'
        >,
        const args extends ContractFunctionArgs<
          abi,
          'nonpayable' | 'payable',
          functionName
        >,
      >(
        options: contract.write.Options<abi, functionName, args, chain>,
      ) => Promise<contract.write.ReturnType>
    }
    logs: {
      /**
       * Returns a list of event logs matching the provided parameters.
       *
       * @example
       * ```ts
       * import { AbiEvent } from 'ox'
       * import { Client, http, publicActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(publicActions())
       * const logs = await client.logs.get({
       *   event: AbiEvent.from(
       *     'event Transfer(address indexed from, address indexed to, uint256 value)',
       *   ),
       * })
       * ```
       */
      get: <
        const abiEvent extends
          | AbiEvent.AbiEvent
          | readonly AbiEvent.AbiEvent[]
          | undefined = undefined,
        strict extends boolean | undefined = undefined,
        fromBlock extends Block.Number | Block.Tag | undefined = undefined,
        toBlock extends Block.Number | Block.Tag | undefined = undefined,
      >(
        options?:
          | logs.get.Options<abiEvent, strict, fromBlock, toBlock>
          | undefined,
      ) => Promise<logs.get.ReturnType<abiEvent, strict, fromBlock, toBlock>>
    }
    fee: {
      /**
       * Returns an estimate for the fees per gas (in wei) for a transaction to
       * be likely included in the next block.
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
       * const fees = await client.fee.estimateFeesPerGas()
       * ```
       */
      estimateFeesPerGas: <type extends Fee.FeeValuesType = 'eip1559'>(
        options?: fee.estimateFeesPerGas.Options<type> | undefined,
      ) => Promise<fee.estimateFeesPerGas.ReturnType<type>>
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
       * const maxPriorityFeePerGas = await client.fee.estimateMaxPriorityFeePerGas()
       * ```
       */
      estimateMaxPriorityFeePerGas: (
        options?: fee.estimateMaxPriorityFeePerGas.Options | undefined,
      ) => Promise<fee.estimateMaxPriorityFeePerGas.ReturnType>
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
       * const blobBaseFee = await client.fee.getBlobBaseFee()
       * ```
       */
      getBlobBaseFee: () => Promise<fee.getBlobBaseFee.ReturnType>
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
       * const gasPrice = await client.fee.getGasPrice()
       * ```
       */
      getGasPrice: () => Promise<fee.getGasPrice.ReturnType>
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
       * const feeHistory = await client.fee.getHistory({
       *   blockCount: 4,
       *   rewardPercentiles: [25, 75],
       * })
       * ```
       */
      getHistory: (
        options: fee.getHistory.Options,
      ) => Promise<fee.getHistory.ReturnType>
    }
    transaction: {
      /**
       * Estimates the gas necessary to complete a transaction without
       * submitting it to the network.
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
       * const gas = await client.transaction.estimateGas({
       *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
       *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
       *   value: 1n,
       * })
       * ```
       */
      estimateGas: (
        options?: transaction.estimateGas.Options | undefined,
      ) => Promise<transaction.estimateGas.ReturnType>
      /**
       * Fills a transaction request with the fields required to be signed over,
       * via `eth_fillTransaction`.
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
       * const { raw, transaction } = await client.transaction.fill({
       *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
       *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
       *   value: 1n,
       * })
       * ```
       */
      fill: (
        options: transaction.fill.Options<chain>,
      ) => Promise<transaction.fill.ReturnType<chain>>
      /**
       * Returns information about a transaction given a hash or block
       * identifier.
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
       * const transaction = await client.transaction.get({
       *   hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
       * })
       * ```
       */
      get: <blockTag extends Block.Tag = 'latest'>(
        options: transaction.get.Options<blockTag>,
      ) => Promise<transaction.get.ReturnType<chain, blockTag>>
      /**
       * Returns the number of blocks passed (confirmations) since the
       * transaction was processed on a block.
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
       * const confirmations = await client.transaction.getConfirmations({
       *   hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
       * })
       * ```
       */
      getConfirmations: (
        options: transaction.getConfirmations.Options<chain>,
      ) => Promise<transaction.getConfirmations.ReturnType>
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
       * const receipt = await client.transaction.getReceipt({
       *   hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
       * })
       * ```
       */
      getReceipt: (
        options: transaction.getReceipt.Options,
      ) => Promise<transaction.getReceipt.ReturnType<chain>>
      /**
       * Prepares a transaction request for signing, by populating the fields
       * required to be signed over (e.g. `nonce`, `chainId`, `type`, fees,
       * `gas`).
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
       * const { request } = await client.transaction.prepare({
       *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
       *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
       *   value: 1n,
       * })
       * ```
       */
      prepare: <const options extends transaction.prepare.Options<chain>>(
        options: transaction.prepare.Options<chain> & options,
      ) => Promise<transaction.prepare.ReturnType<chain, account, options>>
      /**
       * Creates, signs, and sends a new transaction to the network.
       *
       * @example
       * ```ts
       * import { Account, Client, http, publicActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   account: Account.fromPrivateKey('0x…'),
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(publicActions())
       * const hash = await client.transaction.send({
       *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
       *   value: 1n,
       * })
       * ```
       */
      send: (
        options: transaction.send.Options<chain>,
      ) => Promise<transaction.send.ReturnType>
      /**
       * Sends a signed serialized transaction to the network.
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
       * const hash = await client.transaction.sendRaw({
       *   transaction: '0x02f850018203118080825208808080c080a0…',
       * })
       * ```
       */
      sendRaw: (
        options: transaction.sendRaw.Options,
      ) => Promise<transaction.sendRaw.ReturnType>
      /**
       * Signs a transaction.
       *
       * @example
       * ```ts
       * import { Account, Client, http, publicActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   account: Account.fromPrivateKey('0x…'),
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(publicActions())
       * const signed = await client.transaction.sign({
       *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
       *   value: 1n,
       * })
       * ```
       */
      sign: (
        options: transaction.sign.Options<chain>,
      ) => Promise<transaction.sign.ReturnType>
      /**
       * Waits for a transaction to be included on a block (one confirmation by
       * default), returning a watcher handle whose `receipt` promise resolves
       * with the transaction receipt.
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
       * const { receipt } = client.transaction.waitForReceipt({
       *   hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
       * })
       * await receipt
       * ```
       */
      waitForReceipt: (
        options: transaction.waitForReceipt.Options,
      ) => transaction.waitForReceipt.ReturnType<chain>
    }
  }
}
