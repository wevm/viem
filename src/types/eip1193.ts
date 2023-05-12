import type { Address } from 'abitype'

import type { BlockTag } from './block.js'
import type { Hash, Hex, LogTopic } from './misc.js'
import type {
  Quantity,
  RpcBlock as Block,
  RpcBlockIdentifier as BlockIdentifier,
  RpcBlockNumber as BlockNumber,
  RpcFeeHistory as FeeHistory,
  RpcLog as Log,
  RpcTransaction as Transaction,
  RpcTransactionReceipt as TransactionReceipt,
  RpcTransactionRequest as TransactionRequest,
  RpcUncle as Uncle,
} from './rpc.js'

//////////////////////////////////////////////////
// Provider

export type EIP1193Provider = Requests & Events

//////////////////////////////////////////////////
// Errors

// rome-ignore format: no formatting
export type RpcErrorCode =
  // https://eips.ethereum.org/EIPS/eip-1193#provider-errors
  | 4_001 | 4_100 | 4_200 | 4_900 | 4_901
  // https://eips.ethereum.org/EIPS/eip-1474#error-codes
  | -32700 | -32600 | -32601 | -32602 | -32603 | -32000 | -32001 | -32002 | -32003 | -32004 | -32005 | -32006
export class RpcError extends Error {
  code: RpcErrorCode | (number & {})
  details: string

  constructor(code: RpcErrorCode | (number & {}), message: string) {
    super(message)
    this.code = code
    this.details = message
  }
}

//////////////////////////////////////////////////
// Provider Events

export type ProviderConnectInfo = {
  chainId: string
}

export type ProviderMessage = {
  type: string
  data: unknown
}

export type Events = {
  on(
    event: 'connect',
    listener: (connectInfo: ProviderConnectInfo) => void,
  ): void
  on(event: 'disconnect', listener: (error: RpcError) => void): void
  on(event: 'chainChanged', listener: (chainId: string) => void): void
  on(event: 'accountsChanged', listener: (accounts: string[]) => void): void
  on(event: 'message', listener: (message: ProviderMessage) => void): void

  removeListener(
    event: 'connect',
    listener: (connectInfo: ProviderConnectInfo) => void,
  ): void
  removeListener(event: 'disconnect', listener: (error: RpcError) => void): void
  removeListener(
    event: 'chainChanged',
    listener: (chainId: string) => void,
  ): void
  removeListener(
    event: 'accountsChanged',
    listener: (accounts: Address[]) => void,
  ): void
  removeListener(
    event: 'message',
    listener: (message: ProviderMessage) => void,
  ): void
}

//////////////////////////////////////////////////
// Provider Requests

export type Chain = {
  /** A 0x-prefixed hexadecimal string */
  chainId: string
  /** The chain name. */
  chainName: string
  /** Native currency for the chain. */
  nativeCurrency?: {
    name: string
    symbol: string
    decimals: number
  }
  rpcUrls: readonly string[]
  blockExplorerUrls?: string[]
  iconUrls?: string[]
}

export type NetworkSync = {
  /** The current block number */
  currentBlock: Quantity
  /** Number of latest block on the network */
  highestBlock: Quantity
  /** Block number at which syncing started */
  startingBlock: Quantity
}

export type WalletPermissionCaveat = {
  type: string
  value: any
}

export type WalletPermission = {
  caveats: WalletPermissionCaveat[]
  date: number
  id: string
  invoker: `http://${string}` | `https://${string}`
  parentCapability: 'eth_accounts' | string
}

export type WatchAssetParams = {
  /** Token type. */
  type: 'ERC20'
  options: {
    /** The address of the token contract */
    address: string
    /** A ticker symbol or shorthand, up to 11 characters */
    symbol: string
    /** The number of token decimals */
    decimals: number
    /** A string url of the token logo */
    image?: string
  }
}

export type PublicRequests = {
  request(args: {
    /**
     * @description Returns the version of the current client
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'web3_clientVersion' })
     * // => 'MetaMask/v1.0.0'
     */
    method: 'web3_clientVersion'
    params?: never
  }): Promise<string>
  request(args: {
    /**
     * @description Hashes data using the Keccak-256 algorithm
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'web3_sha3', params: ['0x68656c6c6f20776f726c64'] })
     * // => '0xc94770007dda54cF92009BFF0dE90c06F603a09f'
     */
    method: 'web3_sha3'
    params: [data: Hash]
  }): Promise<string>
  request(args: {
    /**
     * @description Determines if this client is listening for new network connections
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'net_listening' })
     * // => true
     */
    method: 'net_listening'
    params?: never
  }): Promise<boolean>
  request(args: {
    /**
     * @description Returns the number of peers currently connected to this client
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'net_peerCount' })
     * // => '0x1'
     */
    method: 'net_peerCount'
    params?: never
  }): Promise<Quantity>
  request(args: {
    /**
     * @description Returns the chain ID associated with the current network
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'net_version' })
     * // => '1'
     */
    method: 'net_version'
    params?: never
  }): Promise<Quantity>
  request(args: {
    /**
     * @description Returns the number of the most recent block seen by this client
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_blockNumber' })
     * // => '0x1b4'
     * */
    method: 'eth_blockNumber'
    params?: never
  }): Promise<Quantity>
  request(args: {
    /**
     * @description Executes a new message call immediately without submitting a transaction to the network
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_call', params: [{ to: '0x...', data: '0x...' }] })
     * // => '0x...'
     */
    method: 'eth_call'
    params: [
      request: Partial<TransactionRequest>,
      block?: BlockNumber | BlockTag | BlockIdentifier,
    ]
  }): Promise<Hex>
  request(args: {
    /**
     * @description Returns the chain ID associated with the current network
     * @example
     * provider.request({ method: 'eth_chainId' })
     * // => '1'
     */
    method: 'eth_chainId'
    params?: never
  }): Promise<Quantity>
  request(args: { method: 'eth_coinbase'; params?: never }): Promise<Address>
  request(args: {
    /**
     * @description Estimates the gas necessary to complete a transaction without submitting it to the network
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({
     *  method: 'eth_estimateGas',
     *  params: [{ from: '0x...', to: '0x...', value: '0x...' }]
     * })
     * // => '0x5208'
     * */
    method: 'eth_estimateGas'
    params: [parameters: TransactionRequest, block?: BlockNumber | BlockTag]
  }): Promise<Quantity>
  request(args: {
    /**
     * @description Returns a collection of historical gas information
     * @link https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1559.md
     * @example
     * provider.request({
     *  method: 'eth_feeHistory',
     *  params: ['4', 'latest', ['25', '75']]
     * })
     * // => {
     * //   oldestBlock: '0x1',
     * //   baseFeePerGas: ['0x1', '0x2', '0x3', '0x4'],
     * //   gasUsedRatio: ['0x1', '0x2', '0x3', '0x4'],
     * //   reward: [['0x1', '0x2'], ['0x3', '0x4'], ['0x5', '0x6'], ['0x7', '0x8']]
     * // }
     * */
    method: 'eth_feeHistory'
    params: [
      /** Number of blocks in the requested range. Between 1 and 1024 blocks can be requested in a single query. Less than requested may be returned if not all blocks are available. */
      blockCount: Quantity,
      /** Highest number block of the requested range. */
      newestBlock: BlockNumber | BlockTag,
      /** A monotonically increasing list of percentile values to sample from each block's effective priority fees per gas in ascending order, weighted by gas used. */
      rewardPercentiles: number[] | undefined,
    ]
  }): Promise<FeeHistory>
  request(args: {
    /**
     * @description Returns the current price of gas expressed in wei
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_gasPrice' })
     * // => '0x09184e72a000'
     * */
    method: 'eth_gasPrice'
    params?: never
  }): Promise<Quantity>
  request(args: {
    /**
     * @description Returns the balance of an address in wei
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_getBalance', params: ['0x...', 'latest'] })
     * // => '0x12a05...'
     * */
    method: 'eth_getBalance'
    params: [address: Address, block: BlockNumber | BlockTag | BlockIdentifier]
  }): Promise<Quantity>
  request(args: {
    /**
     * @description Returns information about a block specified by hash
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_getBlockByHash', params: ['0x...', true] })
     * // => {
     * //   number: '0x1b4',
     * //   hash: '0x...',
     * //   parentHash: '0x...',
     * //   ...
     * // }
     * */
    method: 'eth_getBlockByHash'
    params: [
      /** hash of a block */
      hash: Hash,
      /** true will pull full transaction objects, false will pull transaction hashes */
      includeTransactionObjects: boolean,
    ]
  }): Promise<Block | null>
  request(args: {
    /**
     * @description Returns information about a block specified by number
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_getBlockByNumber', params: ['0x1b4', true] })
     * // => {
     * //   number: '0x1b4',
     * //   hash: '0x...',
     * //   parentHash: '0x...',
     * //   ...
     * // }
     * */
    method: 'eth_getBlockByNumber'
    params: [
      /** block number, or one of "latest", "safe", "finalized", "earliest" or "pending" */
      block: BlockNumber | BlockTag,
      /** true will pull full transaction objects, false will pull transaction hashes */
      includeTransactionObjects: boolean,
    ]
  }): Promise<Block | null>
  request(args: {
    /**
     * @description Returns the number of transactions in a block specified by block hash
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_getBlockTransactionCountByHash', params: ['0x...'] })
     * // => '0x1'
     * */
    method: 'eth_getBlockTransactionCountByHash'
    params: [hash: Hash]
  }): Promise<Quantity>
  request(args: {
    /**
     * @description Returns the number of transactions in a block specified by block number
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_getBlockTransactionCountByNumber', params: ['0x1b4'] })
     * // => '0x1'
     * */
    method: 'eth_getBlockTransactionCountByNumber'
    params: [block: BlockNumber | BlockTag]
  }): Promise<Quantity>
  request(args: {
    /**
     * @description Returns the contract code stored at a given address
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_getCode', params: ['0x...', 'latest'] })
     * // => '0x...'
     * */
    method: 'eth_getCode'
    params: [address: Address, block: BlockNumber | BlockTag | BlockIdentifier]
  }): Promise<Hex>
  request(args: {
    /**
     * @description Returns a list of all logs based on filter ID since the last log retrieval
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_getFilterChanges', params: ['0x...'] })
     * // => [{ ... }, { ... }]
     * */
    method: 'eth_getFilterChanges'
    params: [filterId: Quantity]
  }): Promise<Log[] | Hex[]>
  request(args: {
    /**
     * @description Returns a list of all logs based on filter ID
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_getFilterLogs', params: ['0x...'] })
     * // => [{ ... }, { ... }]
     * */
    method: 'eth_getFilterLogs'
    params: [filterId: Quantity]
  }): Promise<Log[]>
  request(args: {
    /**
     * @description Returns a list of all logs based on a filter object
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_getLogs', params: [{ fromBlock: '0x...', toBlock: '0x...', address: '0x...', topics: ['0x...'] }] })
     * // => [{ ... }, { ... }]
     * */
    method: 'eth_getLogs'
    params: [
      parameters: {
        address?: Address | Address[]
        topics?: LogTopic[]
      } & (
        | {
            fromBlock?: BlockNumber | BlockTag
            toBlock?: BlockNumber | BlockTag
            blockHash?: never
          }
        | {
            fromBlock?: never
            toBlock?: never
            blockHash?: Hash
          }
      ),
    ]
  }): Promise<Log[]>
  request(args: {
    /**
     * @description Returns the value from a storage position at an address
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_getStorageAt', params: ['0x...', '0x...', 'latest'] })
     * // => '0x...'
     * */
    method: 'eth_getStorageAt'
    params: [
      address: Address,
      index: Quantity,
      block: BlockNumber | BlockTag | BlockIdentifier,
    ]
  }): Promise<Hex>
  request(args: {
    /**
     * @description Returns information about a transaction specified by block hash and transaction index
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_getTransactionByBlockHashAndIndex', params: ['0x...', '0x...'] })
     * // => { ... }
     * */
    method: 'eth_getTransactionByBlockHashAndIndex'
    params: [hash: Hash, index: Quantity]
  }): Promise<Transaction | null>
  request(args: {
    /**
     * @description Returns information about a transaction specified by block number and transaction index
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_getTransactionByBlockNumberAndIndex', params: ['0x...', '0x...'] })
     * // => { ... }
     * */
    method: 'eth_getTransactionByBlockNumberAndIndex'
    params: [block: BlockNumber | BlockTag, index: Quantity]
  }): Promise<Transaction | null>
  request(args: {
    /**
     * @description Returns information about a transaction specified by hash
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_getTransactionByHash', params: ['0x...'] })
     * // => { ... }
     * */
    method: 'eth_getTransactionByHash'
    params: [hash: Hash]
  }): Promise<Transaction | null>
  request(args: {
    /**
     * @description Returns the number of transactions sent from an address
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_getTransactionCount', params: ['0x...', 'latest'] })
     * // => '0x1'
     * */
    method: 'eth_getTransactionCount'
    params: [address: Address, block: BlockNumber | BlockTag | BlockIdentifier]
  }): Promise<Quantity>
  request(args: {
    /**
     * @description Returns the receipt of a transaction specified by hash
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_getTransactionReceipt', params: ['0x...'] })
     * // => { ... }
     * */
    method: 'eth_getTransactionReceipt'
    params: [hash: Hash]
  }): Promise<TransactionReceipt | null>
  request(args: {
    /**
     * @description Returns information about an uncle specified by block hash and uncle index position
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_getUncleByBlockHashAndIndex', params: ['0x...', '0x...'] })
     * // => { ... }
     * */
    method: 'eth_getUncleByBlockHashAndIndex'
    params: [hash: Hash, index: Quantity]
  }): Promise<Uncle | null>
  request(args: {
    /**
     * @description Returns information about an uncle specified by block number and uncle index position
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_getUncleByBlockNumberAndIndex', params: ['0x...', '0x...'] })
     * // => { ... }
     * */
    method: 'eth_getUncleByBlockNumberAndIndex'
    params: [block: BlockNumber | BlockTag, index: Quantity]
  }): Promise<Uncle | null>
  request(args: {
    /**
     * @description Returns the number of uncles in a block specified by block hash
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_getUncleCountByBlockHash', params: ['0x...'] })
     * // => '0x1'
     * */
    method: 'eth_getUncleCountByBlockHash'
    params: [hash: Hash]
  }): Promise<Quantity>
  request(args: {
    /**
     * @description Returns the number of uncles in a block specified by block number
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_getUncleCountByBlockNumber', params: ['0x...'] })
     * // => '0x1'
     * */
    method: 'eth_getUncleCountByBlockNumber'
    params: [block: BlockNumber | BlockTag]
  }): Promise<Quantity>
  request(args: {
    /**
     * @description Creates a filter to listen for new blocks that can be used with `eth_getFilterChanges`
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_newBlockFilter' })
     * // => '0x1'
     * */
    method: 'eth_newBlockFilter'
    params?: never
  }): Promise<Quantity>
  request(args: {
    /**
     * @description Creates a filter to listen for specific state changes that can then be used with `eth_getFilterChanges`
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_newFilter', params: [{ fromBlock: '0x...', toBlock: '0x...', address: '0x...', topics: ['0x...'] }] })
     * // => '0x1'
     * */
    method: 'eth_newFilter'
    params: [
      filter: {
        fromBlock?: BlockNumber | BlockTag
        toBlock?: BlockNumber | BlockTag
        address?: Address | Address[]
        topics?: LogTopic[]
      },
    ]
  }): Promise<Quantity>
  request(args: {
    /**
     * @description Creates a filter to listen for new pending transactions that can be used with `eth_getFilterChanges`
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_newPendingTransactionFilter' })
     * // => '0x1'
     * */
    method: 'eth_newPendingTransactionFilter'
    params?: never
  }): Promise<Quantity>
  request(args: {
    /**
     * @description Returns the current Ethereum protocol version
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_protocolVersion' })
     * // => '54'
     * */
    method: 'eth_protocolVersion'
    params?: never
  }): Promise<string>
  request(args: {
    /**
     * @description Sends and already-signed transaction to the network
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_sendRawTransaction', params: ['0x...'] })
     * // => '0x...'
     * */
    method: 'eth_sendRawTransaction'
    params: [signedTransaction: Hex]
  }): Promise<Hex>
  request(args: {
    /**
     * @description Destroys a filter based on filter ID
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_uninstallFilter', params: ['0x1'] })
     * // => true
     * */
    method: 'eth_uninstallFilter'
    params: [
      /** ID of the filter to destroy */
      filterId: Quantity,
    ]
  }): Promise<boolean>
}

export type TestRequests<Name extends string> = {
  request(args: {
    /**
     * @description Add information about compiled contracts
     * @link https://hardhat.org/hardhat-network/docs/reference#hardhat_addcompilationresult
     */
    method: `${Name}_addCompilationResult`
    params: any[]
  }): Promise<any>
  request(args: {
    /**
     * @description Remove a transaction from the mempool
     * @link https://hardhat.org/hardhat-network/docs/reference#hardhat_droptransaction
     */
    method: `${Name}_dropTransaction`
    params: [hash: Hash]
  }): Promise<void>
  request(args: {
    /**
     * @description Turn on call traces for transactions that are returned to the user when they execute a transaction (instead of just txhash/receipt).
     */
    method: `${Name}_enableTraces`
    params?: never
  }): Promise<void>
  request(args: {
    /**
     * @description Impersonate an account or contract address.
     * @link https://hardhat.org/hardhat-network/docs/reference#hardhat_impersonateaccount
     */
    method: `${Name}_impersonateAccount`
    params: [address: Address]
  }): Promise<void>
  request(args: {
    /**
     * @description Returns true if automatic mining is enabled, and false otherwise. See [Mining Modes](https://hardhat.org/hardhat-network/explanation/mining-modes) to learn more.
     * @link https://hardhat.org/hardhat-network/docs/reference#hardhat_getautomine
     */
    method: `${Name}_getAutomine`
  }): Promise<boolean>
  request(args: {
    /**
     * @description Advance the block number of the network by a certain number of blocks
     * @link https://hardhat.org/hardhat-network/docs/reference#hardhat_mine
     */
    method: `${Name}_mine`
    params: [
      /** Number of blocks to mine. */
      count: Hex,
      /** Interval between each block in seconds. */
      interval: Hex | undefined,
    ]
  }): Promise<void>
  request(args: {
    /**
     * @description Resets the fork.
     * @link https://hardhat.org/hardhat-network/docs/reference#hardhat_reset
     */
    method: `${Name}_reset`
    params: any[]
  }): Promise<void>
  request(args: {
    /**
     * @description Modifies the balance of an account.
     * @link https://hardhat.org/hardhat-network/docs/reference#hardhat_setbalance
     */
    method: `${Name}_setBalance`
    params: [
      /** The address of the target account. */
      address: Address,
      /** Amount to send in wei. */
      value: Quantity,
    ]
  }): Promise<void>
  request(args: {
    /**
     * @description Modifies the bytecode stored at an account's address.
     * @link https://hardhat.org/hardhat-network/docs/reference#hardhat_setcode
     */
    method: `${Name}_setCode`
    params: [
      /** The address of the contract. */
      address: Address,
      /** Data bytecode. */
      data: string,
    ]
  }): Promise<void>
  request(args: {
    /**
     * @description Sets the coinbase address to be used in new blocks.
     * @link https://hardhat.org/hardhat-network/docs/reference#hardhat_setcoinbase
     */
    method: `${Name}_setCoinbase`
    params: [
      /** The address to set as the coinbase address. */
      address: Address,
    ]
  }): Promise<void>
  request(args: {
    /**
     * @description Enable or disable logging on the test node network.
     * @link https://hardhat.org/hardhat-network/docs/reference#hardhat_setcoinbase
     */
    method: `${Name}_setLoggingEnabled`
    params: [enabled: boolean]
  }): Promise<void>
  request(args: {
    /**
     * @description Change the minimum gas price accepted by the network (in wei).
     * @link https://hardhat.org/hardhat-network/docs/reference#hardhat_setmingasprice
     */
    method: `${Name}_setMinGasPrice`
    params: [gasPrice: Quantity]
  }): Promise<void>
  request(args: {
    /**
     * @description Sets the base fee of the next block.
     * @link https://hardhat.org/hardhat-network/docs/reference#hardhat_setnextblockbasefeepergas
     */
    method: `${Name}_setNextBlockBaseFeePerGas`
    params: [baseFeePerGas: Quantity]
  }): Promise<void>
  request(args: {
    /**
     * @description Modifies an account's nonce by overwriting it.
     * @link https://hardhat.org/hardhat-network/docs/reference#hardhat_setnonce
     */
    method: `${Name}_setNonce`
    params: [
      /** The account address. */
      address: Address,
      /** The new nonce. */
      nonce: Quantity,
    ]
  }): Promise<void>
  request(args: {
    /**
     * @description Sets the backend RPC URL.
     */
    method: `${Name}_setRpcUrl`
    params: [url: string]
  }): Promise<void>
  request(args: {
    /**
     * @description Writes a single position of an account's storage.
     * @link https://hardhat.org/hardhat-network/docs/reference#hardhat_setstorageat
     */
    method: `${Name}_setStorageAt`
    params: [
      /** The account address. */
      address: Address,
      /** The storage position index. */
      index: Quantity,
      /** The storage value. */
      value: Quantity,
    ]
  }): Promise<void>
  request(args: {
    /**
     * @description Use this method to stop impersonating an account after having previously used impersonateAccount.
     * @link https://hardhat.org/hardhat-network/docs/reference#hardhat_stopimpersonatingaccount
     */
    method: `${Name}_stopImpersonatingAccount`
    params: [
      /** The address to stop impersonating. */
      address: Address,
    ]
  }): Promise<void>
  request(args: {
    /**
     * @description Jump forward in time by the given amount of time, in seconds.
     * @link https://github.com/trufflesuite/ganache/blob/ef1858d5d6f27e4baeb75cccd57fb3dc77a45ae8/src/chains/ethereum/ethereum/RPC-METHODS.md#evm_increasetime
     */
    method: 'evm_increaseTime'
    params: [seconds: Quantity]
  }): Promise<Quantity>
  request(args: {
    /**
     * @description Enables or disables, based on the single boolean argument, the automatic mining of new blocks with each new transaction submitted to the network.
     * @link https://hardhat.org/hardhat-network/docs/reference#evm_setautomine
     */
    method: 'evm_setAutomine'
    params: [boolean]
  }): Promise<void>
  request(args: {
    /**
     * @description Sets the block's gas limit.
     * @link https://hardhat.org/hardhat-network/docs/reference#evm_setblockgaslimit
     */
    method: 'evm_setBlockGasLimit'
    params: [gasLimit: Quantity]
  }): Promise<void>
  request(args: {
    /**
     * @description Similar to `evm_increaseTime` but sets a block timestamp `interval`.
     * The timestamp of the next block will be computed as `lastBlock_timestamp` + `interval`
     */
    method: `${Name}_setBlockTimestampInterval`
    params: [seconds: number]
  }): Promise<void>
  request(args: {
    /**
     * @description Removes `setBlockTimestampInterval` if it exists
     */
    method: `${Name}_removeBlockTimestampInterval`
  }): Promise<void>
  request(args: {
    /**
     * @description Enables (with a numeric argument greater than 0) or disables (with a numeric argument equal to 0), the automatic mining of blocks at a regular interval of milliseconds, each of which will include all pending transactions.
     * @link https://hardhat.org/hardhat-network/docs/reference#evm_setintervalmining
     */
    method: 'evm_setIntervalMining'
    params: [number]
  }): Promise<void>
  request(args: {
    /**
     * @description Set the timestamp of the next block.
     * @link https://hardhat.org/hardhat-network/docs/reference#evm_setnextblocktimestamp
     */
    method: 'evm_setNextBlockTimestamp'
    params: [Quantity]
  }): Promise<void>
  request(args: {
    /**
     * @description Snapshot the state of the blockchain at the current block. Takes no parameters. Returns the id of the snapshot that was created.
     * @link https://hardhat.org/hardhat-network/docs/reference#evm_snapshot
     */
    method: 'evm_snapshot'
    params?: never
  }): Promise<Quantity>
  request(args: {
    /**
     * @description Revert the state of the blockchain to a previous snapshot. Takes a single parameter, which is the snapshot id to revert to.
     */
    method: 'evm_revert'
    params?: [id: Quantity]
  }): Promise<void>
  request(args: {
    /**
     * @link https://geth.ethereum.org/docs/interacting-with-geth/rpc/ns-txpool#txpool-content
     */
    method: 'txpool_content'
    params?: never
  }): Promise<{
    pending: Record<Address, Record<string, Transaction>>
    queued: Record<Address, Record<string, Transaction>>
  }>
  request(args: {
    /**
     * @link https://geth.ethereum.org/docs/interacting-with-geth/rpc/ns-txpool#txpool-inspect
     */
    method: 'txpool_inspect'
    params?: never
  }): Promise<{
    pending: Record<Address, Record<string, string>>
    queued: Record<Address, Record<string, string>>
  }>
  request(args: {
    /**
     * @link https://geth.ethereum.org/docs/interacting-with-geth/rpc/ns-txpool#txpool-inspect
     */
    method: 'txpool_status'
    params?: never
  }): Promise<{
    pending: Quantity
    queued: Quantity
  }>
  request(args: {
    /**
     * @description Creates, signs, and sends a new transaction to the network regardless of the signature.
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_sendTransaction', params: [{ from: '0x...', to: '0x...', value: '0x...' }] })
     * // => '0x...'
     * */
    method: 'eth_sendUnsignedTransaction'
    params: [request: TransactionRequest]
  }): Promise<Hash>
}

export type SignableRequests = {
  request(args: {
    /**
     * @description Creates, signs, and sends a new transaction to the network
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_sendTransaction', params: [{ from: '0x...', to: '0x...', value: '0x...' }] })
     * // => '0x...'
     * */
    method: 'eth_sendTransaction'
    params: [request: TransactionRequest]
  }): Promise<Hash>
  request(args: {
    /**
     * @description Calculates an Ethereum-specific signature in the form of `keccak256("\x19Ethereum Signed Message:\n" + len(message) + message))`
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_sign', params: ['0x...', '0x...'] })
     * // => '0x...'
     * */
    method: 'eth_sign'
    params: [
      /** Address to use for signing */
      address: Address,
      /** Data to sign */
      data: Hex,
    ]
  }): Promise<Hex>
  request(args: {
    /**
     * @description Signs a transaction that can be submitted to the network at a later time using with `eth_sendRawTransaction`
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_signTransaction', params: [{ from: '0x...', to: '0x...', value: '0x...' }] })
     * // => '0x...'
     * */
    method: 'eth_signTransaction'
    params: [request: TransactionRequest]
  }): Promise<Hex>
  request(args: {
    /**
     * @description Calculates an Ethereum-specific signature in the form of `keccak256("\x19Ethereum Signed Message:\n" + len(message) + message))`
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_signTypedData_v4', params: [{ from: '0x...', data: [{ type: 'string', name: 'message', value: 'hello world' }] }] })
     * // => '0x...'
     * */
    method: 'eth_signTypedData_v4'
    params: [
      /** Address to use for signing */
      address: Address,
      /** Message to sign containing type information, a domain separator, and data */
      message: string,
    ]
  }): Promise<Hex>
  request(args: {
    /**
     * @description Returns information about the status of this client’s network synchronization
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_syncing' })
     * // => { startingBlock: '0x...', currentBlock: '0x...', highestBlock: '0x...' }
     * */
    method: 'eth_syncing'
    params?: never
  }): Promise<NetworkSync | false>
  request(args: {
    /**
     * @description Calculates an Ethereum-specific signature in the form of `keccak256("\x19Ethereum Signed Message:\n" + len(message) + message))`
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'personal_sign', params: ['0x...', '0x...'] })
     * // => '0x...'
     * */
    method: 'personal_sign'
    params: [
      /** Data to sign */
      data: Hex,
      /** Address to use for signing */
      address: Address,
    ]
  }): Promise<Hex>
}

export type WalletRequests = {
  request(args: {
    /**
     * @description Returns a list of addresses owned by this client
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_accounts' })
     * // => ['0x0fB69...']
     * */
    method: 'eth_accounts'
    params?: never
  }): Promise<Address[]>
  request(args: {
    /**
     * @description Returns the current chain ID associated with the wallet.
     * @example
     * provider.request({ method: 'eth_chainId' })
     * // => '1'
     */
    method: 'eth_chainId'
    params?: never
  }): Promise<Quantity>
  request(args: {
    /**
     * @description Requests that the user provides an Ethereum address to be identified by. Typically causes a browser extension popup to appear.
     * @link https://eips.ethereum.org/EIPS/eip-1102
     * @example
     * provider.request({ method: 'eth_requestAccounts' })
     * // => ['0x...', '0x...']
     * */
    method: 'eth_requestAccounts'
    params?: never
  }): Promise<Address[]>
  request(args: {
    /**
     * @description Requests the given permissions from the user.
     * @link https://eips.ethereum.org/EIPS/eip-2255
     * @example
     * provider.request({ method: 'wallet_requestPermissions', params: [{ eth_accounts: {} }] })
     * // => { ... }
     * */
    method: 'wallet_requestPermissions'
    params: [permissions: { eth_accounts: Record<string, any> }]
  }): Promise<WalletPermission[]>
  request(args: {
    /**
     * @description Gets the wallets current permissions.
     * @link https://eips.ethereum.org/EIPS/eip-2255
     * @example
     * provider.request({ method: 'wallet_getPermissions' })
     * // => { ... }
     * */
    method: 'wallet_getPermissions'
    params?: never
  }): Promise<WalletPermission[]>
  request(args: {
    /**
     * @description Add an Ethereum chain to the wallet.
     * @link https://eips.ethereum.org/EIPS/eip-3085
     * @example
     * provider.request({ method: 'wallet_addEthereumChain', params: [{ chainId: 1, rpcUrl: 'https://mainnet.infura.io/v3/...' }] })
     * // => { ... }
     */
    method: 'wallet_addEthereumChain'
    params: [chain: Chain]
  }): Promise<null>
  request(args: {
    /**
     * @description Switch the wallet to the given Ethereum chain.
     * @link https://eips.ethereum.org/EIPS/eip-3326
     * @example
     * provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0xf00' }] })
     * // => { ... }
     * */
    method: 'wallet_switchEthereumChain'
    params: [chain: { chainId: string }]
  }): Promise<null>
  /**
   * @description Requests that the user tracks the token in their wallet. Returns a boolean indicating if the token was successfully added.
   * @link https://eips.ethereum.org/EIPS/eip-747
   * @example
   * provider.request({ method: 'wallet_watchAsset' }] })
   * // => true
   * */
  request(args: {
    method: 'wallet_watchAsset'
    params: WatchAssetParams
  }): Promise<boolean>
}

export type Requests = PublicRequests & SignableRequests & WalletRequests
