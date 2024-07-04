import type { Address } from 'abitype'

import type { BlockTag } from './block.js'
import type { Hash, Hex, LogTopic } from './misc.js'
import type { RpcStateOverride } from './rpc.js'
import type {
  RpcBlock as Block,
  RpcBlockIdentifier as BlockIdentifier,
  RpcBlockNumber as BlockNumber,
  RpcFeeHistory as FeeHistory,
  RpcLog as Log,
  RpcProof as Proof,
  Quantity,
  RpcTransaction as Transaction,
  RpcTransactionReceipt as TransactionReceipt,
  RpcTransactionRequest as TransactionRequest,
  RpcUncle as Uncle,
} from './rpc.js'
import type { ExactPartial, OneOf, Prettify } from './utils.js'

//////////////////////////////////////////////////
// Provider

export type EIP1474Methods = [...PublicRpcSchema, ...WalletRpcSchema]

export type EIP1193Provider = Prettify<
  EIP1193Events & {
    request: EIP1193RequestFn<EIP1474Methods>
  }
>

//////////////////////////////////////////////////
// Errors

export type ProviderRpcErrorType = ProviderRpcError & {
  name: 'ProviderRpcError'
}
export class ProviderRpcError extends Error {
  code: number
  details: string

  constructor(code: number, message: string) {
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

export type EIP1193EventMap = {
  accountsChanged(accounts: Address[]): void
  chainChanged(chainId: string): void
  connect(connectInfo: ProviderConnectInfo): void
  disconnect(error: ProviderRpcError): void
  message(message: ProviderMessage): void
}

export type EIP1193Events = {
  on<TEvent extends keyof EIP1193EventMap>(
    event: TEvent,
    listener: EIP1193EventMap[TEvent],
  ): void
  removeListener<TEvent extends keyof EIP1193EventMap>(
    event: TEvent,
    listener: EIP1193EventMap[TEvent],
  ): void
}

//////////////////////////////////////////////////
// Provider Requests

export type AddEthereumChainParameter = {
  /** A 0x-prefixed hexadecimal string */
  chainId: string
  /** The chain name. */
  chainName: string
  /** Native currency for the chain. */
  nativeCurrency?:
    | {
        name: string
        symbol: string
        decimals: number
      }
    | undefined
  rpcUrls: readonly string[]
  blockExplorerUrls?: string[] | undefined
  iconUrls?: string[] | undefined
}

export type NetworkSync = {
  /** The current block number */
  currentBlock: Quantity
  /** Number of latest block on the network */
  highestBlock: Quantity
  /** Block number at which syncing started */
  startingBlock: Quantity
}

export type WalletCapabilities = {
  [capability: string]: any
}

export type WalletCapabilitiesRecord<
  capabilities extends WalletCapabilities = WalletCapabilities,
  id extends string | number = Hex,
> = {
  [chainId in id]: capabilities
}

export type WalletCallReceipt<quantity = Hex, status = Hex> = {
  logs: {
    address: Hex
    data: Hex
    topics: Hex[]
  }[]
  status: status
  blockHash: Hex
  blockNumber: quantity
  gasUsed: quantity
  transactionHash: Hex
}

export type WalletGrantPermissionsParameters = {
  signer?:
    | {
        type: string
        data?: unknown | undefined
      }
    | undefined
  permissions: readonly {
    data: unknown
    policies: readonly {
      data: unknown
      type: string
    }[]
    required?: boolean | undefined
    type: string
  }[]
  expiry: number
}

export type WalletGrantPermissionsReturnType = {
  expiry: number
  factory?: `0x${string}` | undefined
  factoryData?: string | undefined
  grantedPermissions: readonly {
    data: unknown
    policies: readonly {
      data: unknown
      type: string
    }[]
    required?: boolean | undefined
    type: string
  }[]
  permissionsContext: string
  signerData?:
    | {
        userOpBuilder?: `0x${string}` | undefined
        submitToAddress?: `0x${string}` | undefined
      }
    | undefined
}

export type WalletGetCallsStatusReturnType<quantity = Hex, status = Hex> = {
  status: 'PENDING' | 'CONFIRMED'
  receipts?: WalletCallReceipt<quantity, status>[] | undefined
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

export type WalletSendCallsParameters<
  capabilities extends WalletCapabilities = WalletCapabilities,
  chainId extends Hex | number = Hex,
  quantity extends Quantity | bigint = Quantity,
> = [
  {
    calls: OneOf<
      | {
          to: Address
          data?: Hex | undefined
          value?: quantity | undefined
        }
      | {
          data: Hex
        }
    >[]
    capabilities?: capabilities | undefined
    chainId: chainId
    from: Address
    version: string
  },
]

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
    image?: string | undefined
  }
}

export type PublicRpcSchema = [
  /**
   * @description Returns the version of the current client
   *
   * @example
   * provider.request({ method: 'web3_clientVersion' })
   * // => 'MetaMask/v1.0.0'
   */
  {
    Method: 'web3_clientVersion'
    Parameters?: undefined
    ReturnType: string
  },
  /**
   * @description Hashes data using the Keccak-256 algorithm
   *
   * @example
   * provider.request({ method: 'web3_sha3', params: ['0x68656c6c6f20776f726c64'] })
   * // => '0xc94770007dda54cF92009BFF0dE90c06F603a09f'
   */
  {
    Method: 'web3_sha3'
    Parameters: [data: Hash]
    ReturnType: string
  },
  /**
   * @description Determines if this client is listening for new network connections
   *
   * @example
   * provider.request({ method: 'net_listening' })
   * // => true
   */
  {
    Method: 'net_listening'
    Parameters?: undefined
    ReturnType: boolean
  },
  /**
   * @description Returns the number of peers currently connected to this client
   *
   * @example
   * provider.request({ method: 'net_peerCount' })
   * // => '0x1'
   */
  {
    Method: 'net_peerCount'
    Parameters?: undefined
    ReturnType: Quantity
  },
  /**
   * @description Returns the chain ID associated with the current network
   *
   * @example
   * provider.request({ method: 'net_version' })
   * // => '1'
   */
  {
    Method: 'net_version'
    Parameters?: undefined
    ReturnType: Quantity
  },
  /**
   * @description Returns the base fee per blob gas in wei.
   *
   * @example
   * provider.request({ method: 'eth_blobBaseFee' })
   * // => '0x09184e72a000'
   */
  {
    Method: 'eth_blobBaseFee'
    Parameters?: undefined
    ReturnType: Quantity
  },
  /**
   * @description Returns the number of the most recent block seen by this client
   *
   * @example
   * provider.request({ method: 'eth_blockNumber' })
   * // => '0x1b4'
   */
  {
    Method: 'eth_blockNumber'
    Parameters?: undefined
    ReturnType: Quantity
  },
  /**
   * @description Executes a new message call immediately without submitting a transaction to the network
   *
   * @example
   * provider.request({ method: 'eth_call', params: [{ to: '0x...', data: '0x...' }] })
   * // => '0x...'
   */
  {
    Method: 'eth_call'
    Parameters:
      | [transaction: ExactPartial<TransactionRequest>]
      | [
          transaction: ExactPartial<TransactionRequest>,
          block: BlockNumber | BlockTag | BlockIdentifier,
        ]
      | [
          transaction: ExactPartial<TransactionRequest>,
          block: BlockNumber | BlockTag | BlockIdentifier,
          stateOverrideSet: RpcStateOverride,
        ]
    ReturnType: Hex
  },
  /**
   * @description Returns the chain ID associated with the current network
   * @example
   * provider.request({ method: 'eth_chainId' })
   * // => '1'
   */
  {
    Method: 'eth_chainId'
    Parameters?: undefined
    ReturnType: Quantity
  },
  /**
   * @description Returns the client coinbase address.
   * @example
   * provider.request({ method: 'eth_coinbase' })
   * // => '0x...'
   */
  {
    Method: 'eth_coinbase'
    Parameters?: undefined
    ReturnType: Address
  },
  /**
   * @description Estimates the gas necessary to complete a transaction without submitting it to the network
   *
   * @example
   * provider.request({
   *  method: 'eth_estimateGas',
   *  params: [{ from: '0x...', to: '0x...', value: '0x...' }]
   * })
   * // => '0x5208'
   */
  {
    Method: 'eth_estimateGas'
    Parameters:
      | [transaction: TransactionRequest]
      | [transaction: TransactionRequest, block: BlockNumber | BlockTag]
      | [
          transaction: TransactionRequest,
          block: BlockNumber | BlockTag,
          stateOverride: RpcStateOverride,
        ]
    ReturnType: Quantity
  },
  /**
   * @description Returns a collection of historical gas information
   *
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
  {
    Method: 'eth_feeHistory'
    Parameters: [
      /** Number of blocks in the requested range. Between 1 and 1024 blocks can be requested in a single query. Less than requested may be returned if not all blocks are available. */
      blockCount: Quantity,
      /** Highest number block of the requested range. */
      newestBlock: BlockNumber | BlockTag,
      /** A monotonically increasing list of percentile values to sample from each block's effective priority fees per gas in ascending order, weighted by gas used. */
      rewardPercentiles: number[] | undefined,
    ]
    ReturnType: FeeHistory
  },
  /**
   * @description Returns the current price of gas expressed in wei
   *
   * @example
   * provider.request({ method: 'eth_gasPrice' })
   * // => '0x09184e72a000'
   */
  {
    Method: 'eth_gasPrice'
    Parameters?: undefined
    ReturnType: Quantity
  },
  /**
   * @description Returns the balance of an address in wei
   *
   * @example
   * provider.request({ method: 'eth_getBalance', params: ['0x...', 'latest'] })
   * // => '0x12a05...'
   */
  {
    Method: 'eth_getBalance'
    Parameters: [
      address: Address,
      block: BlockNumber | BlockTag | BlockIdentifier,
    ]
    ReturnType: Quantity
  },
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
   */
  {
    Method: 'eth_getBlockByHash'
    Parameters: [
      /** hash of a block */
      hash: Hash,
      /** true will pull full transaction objects, false will pull transaction hashes */
      includeTransactionObjects: boolean,
    ]
    ReturnType: Block | null
  },
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
   */
  {
    Method: 'eth_getBlockByNumber'
    Parameters: [
      /** block number, or one of "latest", "safe", "finalized", "earliest" or "pending" */
      block: BlockNumber | BlockTag,
      /** true will pull full transaction objects, false will pull transaction hashes */
      includeTransactionObjects: boolean,
    ]
    ReturnType: Block | null
  },
  /**
   * @description Returns the number of transactions in a block specified by block hash
   * @link https://eips.ethereum.org/EIPS/eip-1474
   * @example
   * provider.request({ method: 'eth_getBlockTransactionCountByHash', params: ['0x...'] })
   * // => '0x1'
   */
  {
    Method: 'eth_getBlockTransactionCountByHash'
    Parameters: [hash: Hash]
    ReturnType: Quantity
  },
  /**
   * @description Returns the number of transactions in a block specified by block number
   * @link https://eips.ethereum.org/EIPS/eip-1474
   * @example
   * provider.request({ method: 'eth_getBlockTransactionCountByNumber', params: ['0x1b4'] })
   * // => '0x1'
   */
  {
    Method: 'eth_getBlockTransactionCountByNumber'
    Parameters: [block: BlockNumber | BlockTag]
    ReturnType: Quantity
  },
  /**
   * @description Returns the contract code stored at a given address
   * @link https://eips.ethereum.org/EIPS/eip-1474
   * @example
   * provider.request({ method: 'eth_getCode', params: ['0x...', 'latest'] })
   * // => '0x...'
   */
  {
    Method: 'eth_getCode'
    Parameters: [
      address: Address,
      block: BlockNumber | BlockTag | BlockIdentifier,
    ]
    ReturnType: Hex
  },
  /**
   * @description Returns a list of all logs based on filter ID since the last log retrieval
   * @link https://eips.ethereum.org/EIPS/eip-1474
   * @example
   * provider.request({ method: 'eth_getFilterChanges', params: ['0x...'] })
   * // => [{ ... }, { ... }]
   */
  {
    Method: 'eth_getFilterChanges'
    Parameters: [filterId: Quantity]
    ReturnType: Log[] | Hex[]
  },
  /**
   * @description Returns a list of all logs based on filter ID
   * @link https://eips.ethereum.org/EIPS/eip-1474
   * @example
   * provider.request({ method: 'eth_getFilterLogs', params: ['0x...'] })
   * // => [{ ... }, { ... }]
   */
  {
    Method: 'eth_getFilterLogs'
    Parameters: [filterId: Quantity]
    ReturnType: Log[]
  },
  /**
   * @description Returns a list of all logs based on a filter object
   * @link https://eips.ethereum.org/EIPS/eip-1474
   * @example
   * provider.request({ method: 'eth_getLogs', params: [{ fromBlock: '0x...', toBlock: '0x...', address: '0x...', topics: ['0x...'] }] })
   * // => [{ ... }, { ... }]
   */
  {
    Method: 'eth_getLogs'
    Parameters: [
      {
        address?: Address | Address[] | undefined
        topics?: LogTopic[] | undefined
      } & (
        | {
            fromBlock?: BlockNumber | BlockTag | undefined
            toBlock?: BlockNumber | BlockTag | undefined
            blockHash?: undefined
          }
        | {
            fromBlock?: undefined
            toBlock?: undefined
            blockHash?: Hash | undefined
          }
      ),
    ]
    ReturnType: Log[]
  },
  /**
   * @description Returns the account and storage values of the specified account including the Merkle-proof.
   * @link https://eips.ethereum.org/EIPS/eip-1186
   * @example
   * provider.request({ method: 'eth_getProof', params: ['0x...', ['0x...'], 'latest'] })
   * // => {
   * //   ...
   * // }
   */
  {
    Method: 'eth_getProof'
    Parameters: [
      /** Address of the account. */
      address: Address,
      /** An array of storage-keys that should be proofed and included. */
      storageKeys: Hash[],
      block: BlockNumber | BlockTag,
    ]
    ReturnType: Proof
  },
  /**
   * @description Returns the value from a storage position at an address
   * @link https://eips.ethereum.org/EIPS/eip-1474
   * @example
   * provider.request({ method: 'eth_getStorageAt', params: ['0x...', '0x...', 'latest'] })
   * // => '0x...'
   */
  {
    Method: 'eth_getStorageAt'
    Parameters: [
      address: Address,
      index: Quantity,
      block: BlockNumber | BlockTag | BlockIdentifier,
    ]
    ReturnType: Hex
  },
  /**
   * @description Returns information about a transaction specified by block hash and transaction index
   * @link https://eips.ethereum.org/EIPS/eip-1474
   * @example
   * provider.request({ method: 'eth_getTransactionByBlockHashAndIndex', params: ['0x...', '0x...'] })
   * // => { ... }
   */
  {
    Method: 'eth_getTransactionByBlockHashAndIndex'
    Parameters: [hash: Hash, index: Quantity]
    ReturnType: Transaction | null
  },
  /**
   * @description Returns information about a transaction specified by block number and transaction index
   * @link https://eips.ethereum.org/EIPS/eip-1474
   * @example
   * provider.request({ method: 'eth_getTransactionByBlockNumberAndIndex', params: ['0x...', '0x...'] })
   * // => { ... }
   */
  {
    Method: 'eth_getTransactionByBlockNumberAndIndex'
    Parameters: [block: BlockNumber | BlockTag, index: Quantity]
    ReturnType: Transaction | null
  },
  /**
   * @description Returns information about a transaction specified by hash
   * @link https://eips.ethereum.org/EIPS/eip-1474
   * @example
   * provider.request({ method: 'eth_getTransactionByHash', params: ['0x...'] })
   * // => { ... }
   */
  {
    Method: 'eth_getTransactionByHash'
    Parameters: [hash: Hash]
    ReturnType: Transaction | null
  },
  /**
   * @description Returns the number of transactions sent from an address
   * @link https://eips.ethereum.org/EIPS/eip-1474
   * @example
   * provider.request({ method: 'eth_getTransactionCount', params: ['0x...', 'latest'] })
   * // => '0x1'
   */
  {
    Method: 'eth_getTransactionCount'
    Parameters: [
      address: Address,
      block: BlockNumber | BlockTag | BlockIdentifier,
    ]
    ReturnType: Quantity
  },
  /**
   * @description Returns the receipt of a transaction specified by hash
   * @link https://eips.ethereum.org/EIPS/eip-1474
   * @example
   * provider.request({ method: 'eth_getTransactionReceipt', params: ['0x...'] })
   * // => { ... }
   */
  {
    Method: 'eth_getTransactionReceipt'
    Parameters: [hash: Hash]
    ReturnType: TransactionReceipt | null
  },
  /**
   * @description Returns information about an uncle specified by block hash and uncle index position
   * @link https://eips.ethereum.org/EIPS/eip-1474
   * @example
   * provider.request({ method: 'eth_getUncleByBlockHashAndIndex', params: ['0x...', '0x...'] })
   * // => { ... }
   */
  {
    Method: 'eth_getUncleByBlockHashAndIndex'
    Parameters: [hash: Hash, index: Quantity]
    ReturnType: Uncle | null
  },
  /**
   * @description Returns information about an uncle specified by block number and uncle index position
   * @link https://eips.ethereum.org/EIPS/eip-1474
   * @example
   * provider.request({ method: 'eth_getUncleByBlockNumberAndIndex', params: ['0x...', '0x...'] })
   * // => { ... }
   */
  {
    Method: 'eth_getUncleByBlockNumberAndIndex'
    Parameters: [block: BlockNumber | BlockTag, index: Quantity]
    ReturnType: Uncle | null
  },
  /**
   * @description Returns the number of uncles in a block specified by block hash
   * @link https://eips.ethereum.org/EIPS/eip-1474
   * @example
   * provider.request({ method: 'eth_getUncleCountByBlockHash', params: ['0x...'] })
   * // => '0x1'
   */
  {
    Method: 'eth_getUncleCountByBlockHash'
    Parameters: [hash: Hash]
    ReturnType: Quantity
  },
  /**
   * @description Returns the number of uncles in a block specified by block number
   * @link https://eips.ethereum.org/EIPS/eip-1474
   * @example
   * provider.request({ method: 'eth_getUncleCountByBlockNumber', params: ['0x...'] })
   * // => '0x1'
   */
  {
    Method: 'eth_getUncleCountByBlockNumber'
    Parameters: [block: BlockNumber | BlockTag]
    ReturnType: Quantity
  },
  /**
   * @description Returns the current maxPriorityFeePerGas in wei.
   * @link https://ethereum.github.io/execution-apis/api-documentation/
   * @example
   * provider.request({ method: 'eth_maxPriorityFeePerGas' })
   * // => '0x5f5e100'
   */
  {
    Method: 'eth_maxPriorityFeePerGas'
    Parameters?: undefined
    ReturnType: Quantity
  },
  /**
   * @description Creates a filter to listen for new blocks that can be used with `eth_getFilterChanges`
   * @link https://eips.ethereum.org/EIPS/eip-1474
   * @example
   * provider.request({ method: 'eth_newBlockFilter' })
   * // => '0x1'
   */
  {
    Method: 'eth_newBlockFilter'
    Parameters?: undefined
    ReturnType: Quantity
  },
  /**
   * @description Creates a filter to listen for specific state changes that can then be used with `eth_getFilterChanges`
   * @link https://eips.ethereum.org/EIPS/eip-1474
   * @example
   * provider.request({ method: 'eth_newFilter', params: [{ fromBlock: '0x...', toBlock: '0x...', address: '0x...', topics: ['0x...'] }] })
   * // => '0x1'
   */
  {
    Method: 'eth_newFilter'
    Parameters: [
      filter: {
        fromBlock?: BlockNumber | BlockTag | undefined
        toBlock?: BlockNumber | BlockTag | undefined
        address?: Address | Address[] | undefined
        topics?: LogTopic[] | undefined
      },
    ]
    ReturnType: Quantity
  },
  /**
   * @description Creates a filter to listen for new pending transactions that can be used with `eth_getFilterChanges`
   * @link https://eips.ethereum.org/EIPS/eip-1474
   * @example
   * provider.request({ method: 'eth_newPendingTransactionFilter' })
   * // => '0x1'
   */
  {
    Method: 'eth_newPendingTransactionFilter'
    Parameters?: undefined
    ReturnType: Quantity
  },
  /**
   * @description Returns the current Ethereum protocol version
   * @link https://eips.ethereum.org/EIPS/eip-1474
   * @example
   * provider.request({ method: 'eth_protocolVersion' })
   * // => '54'
   */
  {
    Method: 'eth_protocolVersion'
    Parameters?: undefined
    ReturnType: string
  },
  /**
   * @description Sends a **signed** transaction to the network
   * @link https://eips.ethereum.org/EIPS/eip-1474
   * @example
   * provider.request({ method: 'eth_sendRawTransaction', params: ['0x...'] })
   * // => '0x...'
   */
  {
    Method: 'eth_sendRawTransaction'
    Parameters: [signedTransaction: Hex]
    ReturnType: Hash
  },
  /**
   * @description Destroys a filter based on filter ID
   * @link https://eips.ethereum.org/EIPS/eip-1474
   * @example
   * provider.request({ method: 'eth_uninstallFilter', params: ['0x1'] })
   * // => true
   */
  {
    Method: 'eth_uninstallFilter'
    Parameters: [filterId: Quantity]
    ReturnType: boolean
  },
]

export type TestRpcSchema<TMode extends string> = [
  /**
   * @description Add information about compiled contracts
   * @link https://hardhat.org/hardhat-network/docs/reference#hardhat_addcompilationresult
   */
  {
    Method: `${TMode}_addCompilationResult`
    Parameters: any[]
    ReturnType: any
  },
  /**
   * @description Remove a transaction from the mempool
   * @link https://hardhat.org/hardhat-network/docs/reference#hardhat_droptransaction
   */
  {
    Method: `${TMode}_dropTransaction`
    Parameters: [hash: Hash]
    ReturnType: void
  },
  /**
   * @description Serializes the current state (including contracts code, contract's storage, accounts properties, etc.) into a savable data blob.
   */
  {
    Method: `${TMode}_dumpState`
    Parameters?: undefined
    ReturnType: Hex
  },
  /**
   * @description Turn on call traces for transactions that are returned to the user when they execute a transaction (instead of just txhash/receipt).
   */
  {
    Method: `${TMode}_enableTraces`
    Parameters?: undefined
    ReturnType: void
  },
  /**
   * @description Impersonate an account or contract address.
   * @link https://hardhat.org/hardhat-network/docs/reference#hardhat_impersonateaccount
   */
  {
    Method: `${TMode}_impersonateAccount`
    Parameters: [address: Address]
    ReturnType: void
  },
  /**
   * @description Returns true if automatic mining is enabled, and false otherwise. See [Mining Modes](https://hardhat.org/hardhat-network/explanation/mining-modes) to learn more.
   * @link https://hardhat.org/hardhat-network/docs/reference#hardhat_getautomine
   */
  {
    Method: `${TMode}_getAutomine`
    Parameters?: undefined
    ReturnType: boolean
  },
  /**
   * @description Adds state previously dumped with `dumpState` to the current chain.
   */
  {
    Method: `${TMode}_loadState`
    Parameters?: [Hex] | undefined
    ReturnType: void
  },
  /**
   * @description Advance the block number of the network by a certain number of blocks
   * @link https://hardhat.org/hardhat-network/docs/reference#hardhat_mine
   */
  {
    Method: `${TMode}_mine`
    Parameters: [
      /** Number of blocks to mine. */
      count: Hex,
      /** Interval between each block in seconds. */
      interval: Hex | undefined,
    ]
    ReturnType: void
  },
  /**
   * @description Resets the fork.
   * @link https://hardhat.org/hardhat-network/docs/reference#hardhat_reset
   */
  {
    Method: `${TMode}_reset`
    Parameters: any[]
    ReturnType: void
  },
  /**
   * @description Modifies the balance of an account.
   * @link https://hardhat.org/hardhat-network/docs/reference#hardhat_setbalance
   */
  {
    Method: `${TMode}_setBalance`
    Parameters: [
      /** The address of the target account. */
      address: Address,
      /** Amount to send in wei. */
      balance: Quantity,
    ]
    ReturnType: void
  },
  /**
   * @description Modifies the bytecode stored at an account's address.
   * @link https://hardhat.org/hardhat-network/docs/reference#hardhat_setcode
   */
  {
    Method: `${TMode}_setCode`
    Parameters: [
      /** The address of the contract. */
      address: Address,
      /** Data bytecode. */
      data: string,
    ]
    ReturnType: void
  },
  /**
   * @description Sets the coinbase address to be used in new blocks.
   * @link https://hardhat.org/hardhat-network/docs/reference#hardhat_setcoinbase
   */
  {
    Method: `${TMode}_setCoinbase`
    Parameters: [
      /** The address to set as the coinbase address. */
      address: Address,
    ]
    ReturnType: void
  },
  /**
   * @description Enable or disable logging on the test node network.
   * @link https://hardhat.org/hardhat-network/docs/reference#hardhat_setcoinbase
   */
  {
    Method: `${TMode}_setLoggingEnabled`
    Parameters: [enabled: boolean]
    ReturnType: void
  },
  /**
   * @description Change the minimum gas price accepted by the network (in wei).
   * @link https://hardhat.org/hardhat-network/docs/reference#hardhat_setmingasprice
   */
  {
    Method: `${TMode}_setMinGasPrice`
    Parameters: [gasPrice: Quantity]
    ReturnType: void
  },
  /**
   * @description Sets the base fee of the next block.
   * @link https://hardhat.org/hardhat-network/docs/reference#hardhat_setnextblockbasefeepergas
   */
  {
    Method: `${TMode}_setNextBlockBaseFeePerGas`
    Parameters: [baseFeePerGas: Quantity]
    ReturnType: void
  },
  /**
   * @description Modifies an account's nonce by overwriting it.
   * @link https://hardhat.org/hardhat-network/docs/reference#hardhat_setnonce
   */
  {
    Method: `${TMode}_setNonce`
    Parameters: [
      /** The account address. */
      address: Address,
      /** The new nonce. */
      nonce: Quantity,
    ]
    ReturnType: void
  },
  /**
   * @description Sets the backend RPC URL.
   */
  {
    Method: `${TMode}_setRpcUrl`
    Parameters: [url: string]
    ReturnType: void
  },
  /**
   * @description Writes a single position of an account's storage.
   * @link https://hardhat.org/hardhat-network/docs/reference#hardhat_setstorageat
   */
  {
    Method: `${TMode}_setStorageAt`
    Parameters: [
      /** The account address. */
      address: Address,
      /** The storage position index. */
      index: Quantity,
      /** The storage value. */
      value: Quantity,
    ]
    ReturnType: void
  },
  /**
   * @description Use this method to stop impersonating an account after having previously used impersonateAccount.
   * @link https://hardhat.org/hardhat-network/docs/reference#hardhat_stopimpersonatingaccount
   */
  {
    Method: `${TMode}_stopImpersonatingAccount`
    Parameters: [
      /** The address to stop impersonating. */
      address: Address,
    ]
    ReturnType: void
  },
  /**
   * @description Jump forward in time by the given amount of time, in seconds.
   * @link https://github.com/trufflesuite/ganache/blob/ef1858d5d6f27e4baeb75cccd57fb3dc77a45ae8/src/chains/ethereum/ethereum/RPC-METHODS.md#evm_increasetime
   */
  {
    Method: `${TMode}_increaseTime`
    Parameters: [seconds: number]
    ReturnType: Quantity
  },
  /**
   * @description Modifies the balance of an account.
   * @link https://ganache.dev/#evm_setAccountBalance
   */
  {
    Method: `evm_setAccountBalance`
    Parameters: [
      /** The address of the target account. */
      address: Address,
      /** Amount to send in wei. */
      value: Quantity,
    ]
    ReturnType: void
  },
  /**
   * @description Enables or disables, based on the single boolean argument, the automatic mining of new blocks with each new transaction submitted to the network.
   * @link https://hardhat.org/hardhat-network/docs/reference#evm_setautomine
   */
  {
    Method: `evm_setAutomine`
    Parameters: [boolean]
    ReturnType: void
  },
  /**
   * @description Sets the block's gas limit.
   * @link https://hardhat.org/hardhat-network/docs/reference#evm_setblockgaslimit
   */
  {
    Method: 'evm_setBlockGasLimit'
    Parameters: [gasLimit: Quantity]
    ReturnType: void
  },
  /**
   * @description Jump forward in time by the given amount of time, in seconds.
   * @link https://github.com/trufflesuite/ganache/blob/ef1858d5d6f27e4baeb75cccd57fb3dc77a45ae8/src/chains/ethereum/ethereum/RPC-METHODS.md#evm_increasetime
   */
  {
    Method: `evm_increaseTime`
    Parameters: [seconds: Quantity]
    ReturnType: Quantity
  },
  /**
   * @description Similar to `evm_increaseTime` but sets a block timestamp `interval`.
   * The timestamp of the next block will be computed as `lastBlock_timestamp` + `interval`
   */
  {
    Method: `${TMode}_setBlockTimestampInterval`
    Parameters: [seconds: number]
    ReturnType: void
  },
  /**
   * @description Removes `setBlockTimestampInterval` if it exists
   */
  {
    Method: `${TMode}_removeBlockTimestampInterval`
    Parameters?: undefined
    ReturnType: void
  },
  /**
   * @description Enables (with a numeric argument greater than 0) or disables (with a numeric argument equal to 0), the automatic mining of blocks at a regular interval of milliseconds, each of which will include all pending transactions.
   * @link https://hardhat.org/hardhat-network/docs/reference#evm_setintervalmining
   */
  {
    Method: 'evm_setIntervalMining'
    Parameters: [number]
    ReturnType: void
  },
  /**
   * @description Set the timestamp of the next block.
   * @link https://hardhat.org/hardhat-network/docs/reference#evm_setnextblocktimestamp
   */
  {
    Method: 'evm_setNextBlockTimestamp'
    Parameters: [Quantity]
    ReturnType: void
  },
  /**
   * @description Snapshot the state of the blockchain at the current block. Takes no parameters. Returns the id of the snapshot that was created.
   * @link https://hardhat.org/hardhat-network/docs/reference#evm_snapshot
   */
  {
    Method: 'evm_snapshot'
    Parameters?: undefined
    ReturnType: Quantity
  },
  /**
   * @description Revert the state of the blockchain to a previous snapshot. Takes a single parameter, which is the snapshot id to revert to.
   */
  {
    Method: 'evm_revert'
    Parameters?: [id: Quantity] | undefined
    ReturnType: void
  },
  /**
   * @description Enables the automatic mining of new blocks with each new transaction submitted to the network.
   * @link https://ganache.dev/#miner_start
   */
  {
    Method: 'miner_start'
    Parameters?: undefined
    ReturnType: void
  },
  /**
   * @description Disables the automatic mining of new blocks with each new transaction submitted to the network.
   * @link https://ganache.dev/#miner_stop
   */
  {
    Method: 'miner_stop'
    Parameters?: undefined
    ReturnType: void
  },
  /**
   * @link https://geth.ethereum.org/docs/interacting-with-geth/rpc/ns-txpool#txpool-content
   */
  {
    Method: 'txpool_content'
    Parameters?: undefined
    ReturnType: {
      pending: Record<Address, Record<string, Transaction>>
      queued: Record<Address, Record<string, Transaction>>
    }
  },
  /**
   * @link https://geth.ethereum.org/docs/interacting-with-geth/rpc/ns-txpool#txpool-inspect
   */
  {
    Method: 'txpool_inspect'
    Parameters?: undefined
    ReturnType: {
      pending: Record<Address, Record<string, string>>
      queued: Record<Address, Record<string, string>>
    }
  },
  /**
   * @link https://geth.ethereum.org/docs/interacting-with-geth/rpc/ns-txpool#txpool-inspect
   */
  {
    Method: 'txpool_status'
    Parameters?: undefined
    ReturnType: {
      pending: Quantity
      queued: Quantity
    }
  },
  /**
   * @description Returns whether the client is actively mining new blocks.
   * @link https://eips.ethereum.org/EIPS/eip-1474
   * @example
   * provider.request({ method: 'eth_mining' })
   * // => true
   */
  {
    Method: 'eth_mining'
    Parameters?: undefined
    ReturnType: boolean
  },
  /**
   * @description Advance the block number of the network by a certain number of blocks.
   * @link https://ganache.dev/#evm_mine
   */
  {
    Method: 'evm_mine'
    Parameters?:
      | [
          {
            /** Number of blocks to mine. */
            blocks: Hex
          },
        ]
      | undefined
    ReturnType: void
  },
  /**
   * @description Creates, signs, and sends a new transaction to the network regardless of the signature.
   * @link https://eips.ethereum.org/EIPS/eip-1474
   * @example
   * provider.request({ method: 'eth_sendTransaction', params: [{ from: '0x...', to: '0x...', value: '0x...' }] })
   * // => '0x...'
   */
  {
    Method: 'eth_sendUnsignedTransaction'
    Parameters: [transaction: TransactionRequest]
    ReturnType: Hash
  },
]

export type WalletRpcSchema = [
  /**
   * @description Returns a list of addresses owned by this client
   * @link https://eips.ethereum.org/EIPS/eip-1474
   * @example
   * provider.request({ method: 'eth_accounts' })
   * // => ['0x0fB69...']
   */
  {
    Method: 'eth_accounts'
    Parameters?: undefined
    ReturnType: Address[]
  },
  /**
   * @description Returns the current chain ID associated with the wallet.
   * @example
   * provider.request({ method: 'eth_chainId' })
   * // => '1'
   */
  {
    Method: 'eth_chainId'
    Parameters?: undefined
    ReturnType: Quantity
  },
  /**
   * @description Estimates the gas necessary to complete a transaction without submitting it to the network
   *
   * @example
   * provider.request({
   *  method: 'eth_estimateGas',
   *  params: [{ from: '0x...', to: '0x...', value: '0x...' }]
   * })
   * // => '0x5208'
   */
  {
    Method: 'eth_estimateGas'
    Parameters:
      | [transaction: TransactionRequest]
      | [transaction: TransactionRequest, block: BlockNumber | BlockTag]
      | [
          transaction: TransactionRequest,
          block: BlockNumber | BlockTag,
          stateOverride: RpcStateOverride,
        ]
    ReturnType: Quantity
  },
  /**
   * @description Requests that the user provides an Ethereum address to be identified by. Typically causes a browser extension popup to appear.
   * @link https://eips.ethereum.org/EIPS/eip-1102
   * @example
   * provider.request({ method: 'eth_requestAccounts' }] })
   * // => ['0x...', '0x...']
   */
  {
    Method: 'eth_requestAccounts'
    Parameters?: undefined
    ReturnType: Address[]
  },
  /**
   * @description Creates, signs, and sends a new transaction to the network
   * @link https://eips.ethereum.org/EIPS/eip-1474
   * @example
   * provider.request({ method: 'eth_sendTransaction', params: [{ from: '0x...', to: '0x...', value: '0x...' }] })
   * // => '0x...'
   */
  {
    Method: 'eth_sendTransaction'
    Parameters: [transaction: TransactionRequest]
    ReturnType: Hash
  },
  /**
   * @description Sends and already-signed transaction to the network
   * @link https://eips.ethereum.org/EIPS/eip-1474
   * @example
   * provider.request({ method: 'eth_sendRawTransaction', params: ['0x...'] })
   * // => '0x...'
   */
  {
    Method: 'eth_sendRawTransaction'
    Parameters: [signedTransaction: Hex]
    ReturnType: Hash
  },
  /**
   * @description Calculates an Ethereum-specific signature in the form of `keccak256("\x19Ethereum Signed Message:\n" + len(message) + message))`
   * @link https://eips.ethereum.org/EIPS/eip-1474
   * @example
   * provider.request({ method: 'eth_sign', params: ['0x...', '0x...'] })
   * // => '0x...'
   */
  {
    Method: 'eth_sign'
    Parameters: [
      /** Address to use for signing */
      address: Address,
      /** Data to sign */
      data: Hex,
    ]
    ReturnType: Hex
  },
  /**
   * @description Signs a transaction that can be submitted to the network at a later time using with `eth_sendRawTransaction`
   * @link https://eips.ethereum.org/EIPS/eip-1474
   * @example
   * provider.request({ method: 'eth_signTransaction', params: [{ from: '0x...', to: '0x...', value: '0x...' }] })
   * // => '0x...'
   */
  {
    Method: 'eth_signTransaction'
    Parameters: [request: TransactionRequest]
    ReturnType: Hex
  },
  /**
   * @description Calculates an Ethereum-specific signature in the form of `keccak256("\x19Ethereum Signed Message:\n" + len(message) + message))`
   * @link https://eips.ethereum.org/EIPS/eip-1474
   * @example
   * provider.request({ method: 'eth_signTypedData_v4', params: [{ from: '0x...', data: [{ type: 'string', name: 'message', value: 'hello world' }] }] })
   * // => '0x...'
   */
  {
    Method: 'eth_signTypedData_v4'
    Parameters: [
      /** Address to use for signing */
      address: Address,
      /** Message to sign containing type information, a domain separator, and data */
      message: string,
    ]
    ReturnType: Hex
  },
  /**
   * @description Returns information about the status of this client’s network synchronization
   * @link https://eips.ethereum.org/EIPS/eip-1474
   * @example
   * provider.request({ method: 'eth_syncing' })
   * // => { startingBlock: '0x...', currentBlock: '0x...', highestBlock: '0x...' }
   */
  {
    Method: 'eth_syncing'
    Parameters?: undefined
    ReturnType: NetworkSync | false
  },
  /**
   * @description Calculates an Ethereum-specific signature in the form of `keccak256("\x19Ethereum Signed Message:\n" + len(message) + message))`
   * @link https://eips.ethereum.org/EIPS/eip-1474
   * @example
   * provider.request({ method: 'personal_sign', params: ['0x...', '0x...'] })
   * // => '0x...'
   */
  {
    Method: 'personal_sign'
    Parameters: [
      /** Data to sign */
      data: Hex,
      /** Address to use for signing */
      address: Address,
    ]
    ReturnType: Hex
  },
  /**
   * @description Add an Ethereum chain to the wallet.
   * @link https://eips.ethereum.org/EIPS/eip-3085
   * @example
   * provider.request({ method: 'wallet_addEthereumChain', params: [{ chainId: 1, rpcUrl: 'https://mainnet.infura.io/v3/...' }] })
   * // => { ... }
   */
  {
    Method: 'wallet_addEthereumChain'
    Parameters: [chain: AddEthereumChainParameter]
    ReturnType: null
  },
  /**
   * @description Returns the status of a call batch that was sent via `wallet_sendCalls`.
   * @link https://eips.ethereum.org/EIPS/eip-5792
   * @example
   * provider.request({ method: 'wallet_getCallsStatus' })
   * // => { ... }
   */
  {
    Method: 'wallet_getCallsStatus'
    Parameters?: [string]
    ReturnType: WalletGetCallsStatusReturnType
  },
  /**
   * @description Gets the connected wallet's capabilities.
   * @link https://eips.ethereum.org/EIPS/eip-5792
   * @example
   * provider.request({ method: 'wallet_getCapabilities' })
   * // => { ... }
   */
  {
    Method: 'wallet_getCapabilities'
    Parameters?: [Address]
    ReturnType: Prettify<WalletCapabilitiesRecord>
  },
  /**
   * @description Gets the wallets current permissions.
   * @link https://eips.ethereum.org/EIPS/eip-2255
   * @example
   * provider.request({ method: 'wallet_getPermissions' })
   * // => { ... }
   */
  {
    Method: 'wallet_getPermissions'
    Parameters?: undefined
    ReturnType: WalletPermission[]
  },
  /**
   * @description Requests permissions from a wallet
   * @link https://eips.ethereum.org/EIPS/eip-7715
   * @example
   * provider.request({ method: 'wallet_grantPermissions', params: [{ ... }] })
   * // => { ... }
   */
  {
    Method: 'wallet_grantPermissions'
    Parameters?: [WalletGrantPermissionsParameters]
    ReturnType: Prettify<WalletGrantPermissionsReturnType>
  },
  /**
   * @description Requests the given permissions from the user.
   * @link https://eips.ethereum.org/EIPS/eip-2255
   * @example
   * provider.request({ method: 'wallet_requestPermissions', params: [{ eth_accounts: {} }] })
   * // => { ... }
   */
  {
    Method: 'wallet_requestPermissions'
    Parameters: [permissions: { eth_accounts: Record<string, any> }]
    ReturnType: WalletPermission[]
  },
  /**
   * @description Revokes the given permissions from the user.
   * @link https://github.com/MetaMask/metamask-improvement-proposals/blob/main/MIPs/mip-2.md
   * @example
   * provider.request({ method: 'wallet_revokePermissions', params: [{ eth_accounts: {} }] })
   * // => { ... }
   */
  {
    Method: 'wallet_revokePermissions'
    Parameters: [permissions: { eth_accounts: Record<string, any> }]
    ReturnType: null
  },
  /**
   * @description Requests the connected wallet to send a batch of calls.
   * @link https://eips.ethereum.org/EIPS/eip-5792
   * @example
   * provider.request({ method: 'wallet_sendCalls' })
   * // => { ... }
   */
  {
    Method: 'wallet_sendCalls'
    Parameters?: WalletSendCallsParameters
    ReturnType: string
  },
  /**
   * @description Requests for the wallet to show information about a call batch
   * that was sent via `wallet_sendCalls`.
   * @link https://eips.ethereum.org/EIPS/eip-5792
   * @example
   * provider.request({ method: 'wallet_showCallsStatus', params: ['...'] })
   */
  {
    Method: 'wallet_showCallsStatus'
    Parameters?: [string]
    ReturnType: void
  },
  /**
   * @description Switch the wallet to the given Ethereum chain.
   * @link https://eips.ethereum.org/EIPS/eip-3326
   * @example
   * provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0xf00' }] })
   * // => { ... }
   */
  {
    Method: 'wallet_switchEthereumChain'
    Parameters: [chain: { chainId: string }]
    ReturnType: null
  },
  /**
   * @description Requests that the user tracks the token in their wallet. Returns a boolean indicating if the token was successfully added.
   * @link https://eips.ethereum.org/EIPS/eip-747
   * @example
   * provider.request({ method: 'wallet_watchAsset' }] })
   * // => true
   */
  {
    Method: 'wallet_watchAsset'
    Parameters: WatchAssetParams
    ReturnType: boolean
  },
]

///////////////////////////////////////////////////////////////////////////
// Utils

export type RpcSchema = readonly {
  Method: string
  Parameters?: unknown | undefined
  ReturnType: unknown
}[]

export type RpcSchemaOverride = Omit<RpcSchema[number], 'Method'>

export type EIP1193Parameters<
  TRpcSchema extends RpcSchema | undefined = undefined,
> = TRpcSchema extends RpcSchema
  ? {
      [K in keyof TRpcSchema]: Prettify<
        {
          method: TRpcSchema[K] extends TRpcSchema[number]
            ? TRpcSchema[K]['Method']
            : never
        } & (TRpcSchema[K] extends TRpcSchema[number]
          ? TRpcSchema[K]['Parameters'] extends undefined
            ? { params?: undefined }
            : { params: TRpcSchema[K]['Parameters'] }
          : never)
      >
    }[number]
  : {
      method: string
      params?: unknown | undefined
    }

export type EIP1193RequestOptions = {
  // Deduplicate in-flight requests.
  dedupe?: boolean | undefined
  // The base delay (in ms) between retries.
  retryDelay?: number | undefined
  // The max number of times to retry.
  retryCount?: number | undefined
  /** Unique identifier for the request. */
  uid?: string | undefined
}

type DerivedRpcSchema<
  TRpcSchema extends RpcSchema | undefined,
  TRpcSchemaOverride extends RpcSchemaOverride | undefined,
> = TRpcSchemaOverride extends RpcSchemaOverride
  ? [TRpcSchemaOverride & { Method: string }]
  : TRpcSchema

export type EIP1193RequestFn<
  TRpcSchema extends RpcSchema | undefined = undefined,
> = <
  TRpcSchemaOverride extends RpcSchemaOverride | undefined = undefined,
  TParameters extends EIP1193Parameters<
    DerivedRpcSchema<TRpcSchema, TRpcSchemaOverride>
  > = EIP1193Parameters<DerivedRpcSchema<TRpcSchema, TRpcSchemaOverride>>,
  _ReturnType = DerivedRpcSchema<
    TRpcSchema,
    TRpcSchemaOverride
  > extends RpcSchema
    ? Extract<
        DerivedRpcSchema<TRpcSchema, TRpcSchemaOverride>[number],
        { Method: TParameters['method'] }
      >['ReturnType']
    : unknown,
>(
  args: TParameters,
  options?: EIP1193RequestOptions | undefined,
) => Promise<_ReturnType>
