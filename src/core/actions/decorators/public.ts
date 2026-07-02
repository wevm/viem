import type { Abi } from 'abitype'
import type * as AbiEvent from 'ox/AbiEvent'
import type * as Block from 'ox/Block'
import type * as Fee from 'ox/Fee'

import type * as Account from '../../Account.js'
import type * as Chain from '../../Chain.js'
import type * as Client from '../../Client.js'
import type * as Token from '../../Token.js'
import type * as Transport from '../../Transport.js'
import type {
  ContractFunctionArgs,
  ContractFunctionName,
} from '../internal/contract.js'
import * as address from '../address/index.js'
import * as block from '../block/index.js'
import { call } from '../call.js'
import * as chains from '../chains/index.js'
import * as contract from '../contract/index.js'
import * as filter from '../filter/index.js'
import * as event from '../event/index.js'
import * as fee from '../fee/index.js'
import { simulateBlocks } from '../simulateBlocks.js'
import { simulateCalls } from '../simulateCalls.js'
import * as token from '../token/index.js'
import * as transaction from '../transaction/index.js'

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
    tokens extends Token.Tokens | undefined = undefined,
  >(
    client: Client.Client<chain, account, Transport.Transport, tokens>,
  ): publicActions.Decorator<chain, account, tokens> => ({
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
      createFilter: () => block.createFilter(client),
      get: (options) => block.get(client, options),
      getNumber: (options) => block.getNumber(client, options),
      getReceipts: (options) => block.getReceipts(client, options),
      getTransactionCount: (options) =>
        block.getTransactionCount(client, options),
      watch: (options) => block.watch(client, options),
      watchNumber: (options) => block.watchNumber(client, options),
    },
    call: (options) => call(client, options),
    chains: {
      getId: () => chains.getId(client),
    },
    contract: {
      createEventFilter: (options) =>
        contract.createEventFilter(client, options as never),
      estimateGas: (options) => contract.estimateGas(client, options as never),
      getEip712Domain: (options) => contract.getEip712Domain(client, options),
      getLogs: (options) => contract.getLogs(client, options as never),
      read: (options) => contract.read(client, options),
      simulate: (options) => contract.simulate(client, options as never),
      watchEvent: (options) => contract.watchEvent(client, options as never),
    },
    filter: {
      getChanges: (options) => filter.getChanges(client, options as never),
      getLogs: (options) => filter.getLogs(client, options as never),
      uninstall: (options) => filter.uninstall(client, options),
    },
    event: {
      createFilter: (options) => event.createFilter(client, options as never),
      getLogs: (options) => event.getLogs(client, options as never),
      watch: (options) => event.watch(client, options as never),
    },
    fee: {
      estimateFeesPerGas: (options) => fee.estimateFeesPerGas(client, options),
      estimateMaxPriorityFeePerGas: (options) =>
        fee.estimateMaxPriorityFeePerGas(client, options),
      getBlobBaseFee: () => fee.getBlobBaseFee(client),
      getGasPrice: () => fee.getGasPrice(client),
      getHistory: (options) => fee.getHistory(client, options),
    },
    simulateBlocks: (options) => simulateBlocks(client, options as never),
    simulateCalls: (options) => simulateCalls(client, options as never),
    token: {
      getAllowance: Object.assign(
        (options: never) => token.getAllowance(client, options),
        { call: (args: never) => token.getAllowance.call(client, args) },
      ),
      getBalance: Object.assign(
        (options: never) => token.getBalance(client, options),
        { call: (args: never) => token.getBalance.call(client, args) },
      ),
      getMetadata: (options: never) => token.getMetadata(client, options),
      getTotalSupply: Object.assign(
        (options: never) => token.getTotalSupply(client, options),
        { call: (args: never) => token.getTotalSupply.call(client, args) },
      ),
    } as never,
    transaction: {
      createAccessList: (options) =>
        transaction.createAccessList(client, options),
      createPendingFilter: () => transaction.createPendingFilter(client),
      estimateGas: (options) => transaction.estimateGas(client, options),
      fill: (options) => transaction.fill(client, options),
      get: (options) => transaction.get(client, options),
      getConfirmations: (options) =>
        transaction.getConfirmations(client, options),
      getReceipt: (options) => transaction.getReceipt(client, options),
      prepare: (options) => transaction.prepare(client, options),
      waitForReceipt: (options) => transaction.waitForReceipt(client, options),
      watchPending: (options) => transaction.watchPending(client, options),
    },
  })
}

export declare namespace publicActions {
  type Decorator<
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
    account extends Account.Account | undefined = Account.Account | undefined,
    tokens extends Token.Tokens | undefined = Token.Tokens | undefined,
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
       * Creates a filter to listen for new block hashes.
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
       * const filter = await client.block.createFilter()
       * ```
       */
      createFilter: () => Promise<block.createFilter.ReturnType>
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
       * Watches incoming blocks, returning a watcher handle.
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
       * const watch = client.block.watch()
       * watch.onBlock((block) => console.log(block))
       * // later: watch.off()
       * ```
       */
      watch: <
        includeTransactions extends boolean = false,
        blockTag extends Block.Tag = 'latest',
      >(
        options?:
          | block.watch.Options<includeTransactions, blockTag>
          | undefined,
      ) => block.watch.Watcher<chain, includeTransactions, blockTag>
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
       * Creates a filter to listen for new event logs emitted by a contract.
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
       * const filter = await client.contract.createEventFilter({
       *   abi: Abi.from([
       *     'event Transfer(address indexed from, address indexed to, uint256 value)',
       *   ]),
       *   eventName: 'Transfer',
       * })
       * ```
       */
      createEventFilter: <
        const abi extends Abi | readonly unknown[],
        eventName extends AbiEvent.extractLogs.EventName<abi> | undefined =
          undefined,
        strict extends boolean | undefined = undefined,
        fromBlock extends Block.Number | Block.Tag | undefined = undefined,
        toBlock extends Block.Number | Block.Tag | undefined = undefined,
      >(
        options: contract.createEventFilter.Options<
          abi,
          eventName,
          strict,
          fromBlock,
          toBlock
        >,
      ) => Promise<
        contract.createEventFilter.ReturnType<
          abi,
          eventName,
          strict,
          fromBlock,
          toBlock
        >
      >
      /**
       * Estimates the gas required to successfully execute a contract write
       * (`nonpayable`/`payable`) function call.
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
       * const gas = await client.contract.estimateGas({
       *   abi: Abi.from(['function mint()']),
       *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
       *   account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
       *   functionName: 'mint',
       * })
       * ```
       */
      estimateGas: <
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
        options: contract.estimateGas.Options<abi, functionName, args>,
      ) => Promise<contract.estimateGas.ReturnType>
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
       * Simulates a write (`nonpayable`/`payable`) function on a contract
       * without broadcasting a transaction, returning the decoded `result` and
       * a `request` that can be passed to `contract.write`.
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
       * const { request, result } = await client.contract.simulate({
       *   abi: Abi.from(['function mint(uint32 tokenId) returns (uint32)']),
       *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
       *   args: [69420],
       *   functionName: 'mint',
       * })
       * const hash = await client.contract.write(request)
       * ```
       */
      simulate: <
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
        options: contract.simulate.Options<abi, functionName, args>,
      ) => Promise<contract.simulate.ReturnType<abi, functionName, args>>
      /**
       * Watches incoming contract event logs, returning a watcher handle.
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
       *
       * const watch = client.contract.watchEvent({
       *   abi: Abi.from([
       *     'event Transfer(address indexed from, address indexed to, uint256 value)',
       *   ]),
       *   eventName: 'Transfer',
       * })
       * watch.onLogs((logs) => console.log(logs))
       * // later: watch.off()
       * ```
       */
      watchEvent: <
        const abi extends Abi | readonly unknown[],
        eventName extends AbiEvent.extractLogs.EventName<abi> | undefined =
          undefined,
        strict extends boolean | undefined = undefined,
        fromBlock extends Block.Number | undefined = undefined,
      >(
        options: contract.watchEvent.Options<abi, eventName, strict, fromBlock>,
      ) => contract.watchEvent.Watcher<abi, eventName, strict>
    }
    filter: {
      /**
       * Returns the changes for a filter since it was created or last polled.
       * Block/transaction filters return hashes; event filters return logs.
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
       * // `filter` is returned from a `create*Filter` action.
       * const changes = await client.filter.getChanges({ filter })
       * ```
       */
      getChanges: <
        type extends filter.Type = filter.Type,
        const abiEvent extends
          | AbiEvent.AbiEvent
          | readonly AbiEvent.AbiEvent[]
          | undefined = undefined,
        strict extends boolean | undefined = undefined,
        fromBlock extends Block.Number | Block.Tag | undefined = undefined,
        toBlock extends Block.Number | Block.Tag | undefined = undefined,
      >(
        options: filter.getChanges.Options<
          type,
          abiEvent,
          strict,
          fromBlock,
          toBlock
        >,
      ) => Promise<
        filter.getChanges.ReturnType<type, abiEvent, strict, fromBlock, toBlock>
      >
      /**
       * Returns the list of logs matching an event filter, regardless of when
       * it was created or last polled.
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
       * // `filter` is returned from `event.createFilter`.
       * const logs = await client.filter.getLogs({ filter })
       * ```
       */
      getLogs: <
        const abiEvent extends
          | AbiEvent.AbiEvent
          | readonly AbiEvent.AbiEvent[]
          | undefined = undefined,
        strict extends boolean | undefined = undefined,
        fromBlock extends Block.Number | Block.Tag | undefined = undefined,
        toBlock extends Block.Number | Block.Tag | undefined = undefined,
      >(
        options: filter.getLogs.Options<abiEvent, strict, fromBlock, toBlock>,
      ) => Promise<
        filter.getLogs.ReturnType<abiEvent, strict, fromBlock, toBlock>
      >
      /**
       * Destroys a filter. Returns whether the filter was successfully
       * uninstalled.
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
       * // `filter` is returned from a `create*Filter` action.
       * const uninstalled = await client.filter.uninstall({ filter })
       * ```
       */
      uninstall: (
        options: filter.uninstall.Options,
      ) => Promise<filter.uninstall.ReturnType>
    }
    event: {
      /**
       * Creates a filter to listen for new event logs.
       *
       * @example
       * ```ts
       * import * as AbiEvent from 'ox/AbiEvent'
       * import { Client, http, publicActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(publicActions())
       * const filter = await client.event.createFilter({
       *   event: AbiEvent.from(
       *     'event Transfer(address indexed from, address indexed to, uint256 value)',
       *   ),
       * })
       * ```
       */
      createFilter: <
        const abiEvent extends
          | AbiEvent.AbiEvent
          | readonly AbiEvent.AbiEvent[]
          | undefined = undefined,
        strict extends boolean | undefined = undefined,
        fromBlock extends Block.Number | Block.Tag | undefined = undefined,
        toBlock extends Block.Number | Block.Tag | undefined = undefined,
      >(
        options?:
          | event.createFilter.Options<abiEvent, strict, fromBlock, toBlock>
          | undefined,
      ) => Promise<
        event.createFilter.ReturnType<abiEvent, strict, fromBlock, toBlock>
      >
      /**
       * Returns a list of event logs matching the provided parameters.
       *
       * @example
       * ```ts
       * import * as AbiEvent from 'ox/AbiEvent'
       * import { Client, http, publicActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(publicActions())
       * const logs = await client.event.getLogs({
       *   event: AbiEvent.from(
       *     'event Transfer(address indexed from, address indexed to, uint256 value)',
       *   ),
       * })
       * ```
       */
      getLogs: <
        const abiEvent extends
          | AbiEvent.AbiEvent
          | readonly AbiEvent.AbiEvent[]
          | undefined = undefined,
        strict extends boolean | undefined = undefined,
        fromBlock extends Block.Number | Block.Tag | undefined = undefined,
        toBlock extends Block.Number | Block.Tag | undefined = undefined,
      >(
        options?:
          | event.getLogs.Options<abiEvent, strict, fromBlock, toBlock>
          | undefined,
      ) => Promise<
        event.getLogs.ReturnType<abiEvent, strict, fromBlock, toBlock>
      >
      /**
       * Watches incoming event logs, returning a watcher handle.
       *
       * @example
       * ```ts
       * import * as AbiEvent from 'ox/AbiEvent'
       * import { Client, http, publicActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(publicActions())
       *
       * const watch = client.event.watch({
       *   event: AbiEvent.from(
       *     'event Transfer(address indexed from, address indexed to, uint256 value)',
       *   ),
       * })
       * watch.onLogs((logs) => console.log(logs))
       * // later: watch.off()
       * ```
       */
      watch: <
        const abiEvent extends
          | AbiEvent.AbiEvent
          | readonly AbiEvent.AbiEvent[]
          | undefined = undefined,
        strict extends boolean | undefined = undefined,
        fromBlock extends Block.Number | undefined = undefined,
      >(
        options?: event.watch.Options<abiEvent, strict, fromBlock> | undefined,
      ) => event.watch.Watcher<abiEvent, strict>
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
    /**
     * Simulates a sequence of blocks with optional block and state overrides.
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
     * const [block] = await client.simulateBlocks({
     *   blocks: [{
     *     calls: [{
     *       account: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929',
     *       to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
     *       value: 1n,
     *     }],
     *   }],
     * })
     * ```
     */
    simulateBlocks: <const calls extends readonly unknown[]>(
      options: simulateBlocks.Options<calls>,
    ) => Promise<simulateBlocks.ReturnType<chain, calls>>
    /**
     * Simulates execution of a batch of calls, returning typed per-call
     * results. Executes via `eth_simulateV1`, falling back to a multicall3
     * `aggregate3` batch on nodes without support.
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
     * const { results } = await client.simulateCalls({
     *   account: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929',
     *   calls: [{
     *     to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
     *     value: 1n,
     *   }],
     * })
     * ```
     */
    simulateCalls: <
      const calls extends readonly unknown[],
      mode extends 'auto' | 'simulate' | 'multicall' = 'auto',
      allowFailure extends boolean = true,
      traceAssetChanges extends boolean = false,
      traceTransfers extends boolean = false,
      validation extends boolean = false,
    >(
      options: simulateCalls.Options<
        calls,
        mode,
        allowFailure,
        traceAssetChanges,
        traceTransfers,
        validation
      >,
    ) => Promise<
      simulateCalls.ReturnType<
        chain,
        calls,
        mode,
        allowFailure,
        [traceAssetChanges | traceTransfers | validation] extends [false]
          ? false
          : true
      >
    >
    token: {
      /**
       * Gets the ERC-20 allowance a spender has over an account's tokens.
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
       * const allowance = await client.token.getAllowance({
       *   account: '0x…',
       *   spender: '0x…',
       *   token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
       * })
       * ```
       */
      getAllowance: ((
        options: token.getAllowance.Options<chain, tokens>,
      ) => Promise<token.getAllowance.ReturnType>) & {
        /**
         * Defines an `allowance` contract call, ready to pass to any action
         * that accepts a contract call.
         */
        call: (
          args: token.getAllowance.Args<chain, tokens>,
        ) => ReturnType<typeof token.getAllowance.call>
      }
      /**
       * Gets the ERC-20 token balance of an account.
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
       * const balance = await client.token.getBalance({
       *   account: '0x…',
       *   token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
       * })
       * ```
       */
      getBalance: ((
        options: token.getBalance.Options<chain, account, tokens>,
      ) => Promise<token.getBalance.ReturnType>) & {
        /**
         * Defines a `balanceOf` contract call, ready to pass to any action
         * that accepts a contract call.
         */
        call: (
          args: token.getBalance.Args<chain, account, tokens>,
        ) => ReturnType<typeof token.getBalance.call>
      }
      /**
       * Gets the metadata (`decimals`, `name`, `symbol`) of an ERC-20 token.
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
       * const metadata = await client.token.getMetadata({
       *   token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
       * })
       * ```
       */
      getMetadata: (
        options: token.getMetadata.Options<chain, tokens>,
      ) => Promise<token.getMetadata.ReturnType>
      /**
       * Gets the total supply of an ERC-20 token.
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
       * const totalSupply = await client.token.getTotalSupply({
       *   token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
       * })
       * ```
       */
      getTotalSupply: ((
        options: token.getTotalSupply.Options<chain, tokens>,
      ) => Promise<token.getTotalSupply.ReturnType>) & {
        /**
         * Defines a `totalSupply` contract call, ready to pass to any action
         * that accepts a contract call.
         */
        call: (
          args: token.getTotalSupply.Args<chain, tokens>,
        ) => ReturnType<typeof token.getTotalSupply.call>
      }
    }
    transaction: {
      /**
       * Creates an EIP-2930 access list covering the storage a transaction
       * touches.
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
       * const { accessList, gasUsed } = await client.transaction.createAccessList({
       *   data: '0x06fdde03',
       *   to: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
       * })
       * ```
       */
      createAccessList: (
        options?: transaction.createAccessList.Options | undefined,
      ) => Promise<transaction.createAccessList.ReturnType>
      /**
       * Creates a filter to listen for new pending transaction hashes.
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
       * const filter = await client.transaction.createPendingFilter()
       * ```
       */
      createPendingFilter: () => Promise<transaction.createPendingFilter.ReturnType>
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
      /**
       * Watches incoming pending transaction hashes, returning a watcher
       * handle.
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
       * const watch = client.transaction.watchPending()
       * watch.onTransactions((hashes) => console.log(hashes))
       * // later: watch.off()
       * ```
       */
      watchPending: (
        options?: transaction.watchPending.Options | undefined,
      ) => transaction.watchPending.Watcher
    }
  }
}
