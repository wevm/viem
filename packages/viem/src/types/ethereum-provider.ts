import { ProviderRpcError } from '../utils/errors'

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
  on(event: 'disconnect', listener: (error: ProviderRpcError) => void): void
  on(event: 'chainChanged', listener: (chainId: string) => void): void
  on(event: 'accountsChanged', listener: (accounts: string[]) => void): void
  on(event: 'message', listener: (message: ProviderMessage) => void): void

  removeListener(
    event: 'connect',
    listener: (connectInfo: ProviderConnectInfo) => void,
  ): void
  removeListener(
    event: 'disconnect',
    listener: (error: ProviderRpcError) => void,
  ): void
  removeListener(
    event: 'chainChanged',
    listener: (chainId: string) => void,
  ): void
  removeListener(
    event: 'accountsChanged',
    listener: (accounts: string[]) => void,
  ): void
  removeListener(
    event: 'message',
    listener: (message: ProviderMessage) => void,
  ): void
}

//////////////////////////////////////////////////

// Provider Requests

export type Block = {
  /** Difficulty for this block */
  difficulty: Quantity
  /** "Extra data" field of this block */
  extraData: Data
  /** Maximum gas allowed in this block */
  gasLimit: Quantity
  /** Total used gas by all transactions in this block */
  gasUsed: Quantity
  /** Block hash or `null` if pending */
  hash: Data | null
  /** Logs bloom filter or `null` if pending */
  logsBloom: Data | null
  /** Address that received this block’s mining rewards */
  miner: Data
  /** Proof-of-work hash or `null` if pending */
  nonce: Data | null
  /** Block number or `null` if pending */
  number: Quantity | null
  /** Parent block hash */
  parentHash: Data
  /** Root of the this block’s receipts trie */
  receiptsRoot: Data
  /** SHA3 of the uncles data in this block */
  sha3Uncles: Data
  /** Size of this block in bytes */
  size: Quantity
  /** Root of this block’s final state trie */
  stateRoot: Data
  /** Unix timestamp of when this block was collated */
  timestamp: Quantity
  /** Total difficulty of the chain until this block */
  totalDifficulty: Quantity
  /** List of transaction objects or hashes */
  transactions: Data[]
  /** Root of this block’s transaction trie */
  transactionsRoot: Data
  /** List of uncle hashes */
  uncles: Data[]
}
export type BlockIdentifier = {
  /** Whether or not to throw an error if the block is not in the canonical chain as described below. Only allowed in conjunction with the blockHash tag. Defaults to false. */
  requireCanonical?: boolean
} & (
  | {
      /** The block in the canonical chain with this number */
      blockNumber: Quantity
    }
  | {
      /** The block uniquely identified by this hash. The `blockNumber` and `blockHash` properties are mutually exclusive; exactly one of them must be set. */
      blockHash: Data
    }
)
export type BlockNumber = Quantity
export type BlockTime = 'latest' | 'earliest' | 'pending'

export type Data = `0x${string}`

export type EstimateGasParameters = {
  /** Contract code or a hashed method call with encoded args */
  data?: Data
  /** Gas provided for transaction execution */
  gas?: Quantity
  /** Price in wei of each gas used */
  gasPrice?: Quantity
  /** Transaction sender */
  from?: Data
  /** Transaction recipient */
  to?: Data
  /** Value in wei sent with this transaction */
  value?: Quantity
}

export type Log = {
  /** The address from which this log originated */
  address: Data
  /** Hash of block containing this log or `null` if pending */
  blockHash: Data | null
  /** Contains the non-indexed arguments of the log */
  data: Data
  /** Hash of the transaction that created this log or `null` if pending */
  transactionHash: Data | null
  /** Number of block containing this log or `null` if pending */
  blockNumber: Quantity | null
  /** Index of this log within its block or `null` if pending */
  logIndex: Quantity | null
  /** Index of the transaction that created this log or `null` if pending */
  transactionIndex: Quantity | null
  /** List of order-dependent topics */
  topics: Data[]
  /** `true` if this filter has been destroyed and is invalid */
  removed: boolean
}

export type NativeCurrency = {
  /** A 0x-prefixed hexadecimal string */
  chainId: string
  chainName: string
  nativeCurrency?: {
    name: string
    /** 2-6 characters long */
    symbol: string
    decimals: number
  }
  rpcUrls: string[]
  blockExplorerUrls?: string[]
  /** Currently ignored. */
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

export type Quantity = `0x${string}`

export type TransactionReceipt = {
  /** Hash of block containing this transaction */
  blockHash: Data
  /** Number of block containing this transaction */
  blockNumber: Quantity
  /** Address of new contract or `null` if no contract was created */
  contractAddress: Data | null
  /** Gas used by this and all preceding transactions in this block */
  cumulativeGasUsed: Quantity
  /** Transaction sender */
  from: Data
  /** Gas used by this transaction */
  gasUsed: Quantity
  /** List of log objects generated by this transaction */
  logs: Log[]
  /** Logs bloom filter */
  logsBloom: Data
  /** `1` if this transaction was successful or `0` if it failed */
  status: 0 | 1
  /** Transaction recipient or `null` if deploying a contract */
  to: Data | null
  /** Hash of this transaction */
  transactionHash: Data
  /** Index of this transaction in the block */
  transactionIndex: Quantity
}
export type TransactionResult = {
  /** Hash of block containing this transaction or `null` if pending */
  blockHash: Data | null
  /** Number of block containing this transaction or `null` if pending */
  blockNumber: Quantity
  /** Transaction sender */
  from: Data
  /** Gas provided for transaction execution */
  gas: Quantity
  /** Price in wei of each gas used */
  gasPrice: Quantity
  /** Hash of this transaction */
  hash: Data
  /** Contract code or a hashed method call */
  input: Data
  /** Unique number identifying this transaction */
  nonce: Quantity
  /** ECDSA signature r */
  r: Data
  /** ECDSA signature s */
  s: Data
  /** Transaction recipient or `null` if deploying a contract */
  to: Data | null
  /** Index of this transaction in the block or `null` if pending */
  transactionIndex: Quantity
  /** ECDSA recovery ID */
  v: Quantity
  /** Value in wei sent with this transaction */
  value: Quantity
}
export type TransactionRequest = {
  /** Contract code or a hashed method call with encoded args */
  data?: Data
  /** Transaction sender */
  from: Data
  /** Gas provided for transaction execution */
  gas?: Quantity
  /** Price in wei of each gas used */
  gasPrice?: Quantity
  /** Unique number identifying this transaction */
  nonce?: Quantity
  /** Transaction recipient */
  to?: Data
  /** Value in wei sent with this transaction */
  value?: Quantity
}

export type Uncle = Block

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
    image: string
  }
}

export type ConnectedRequests = {
  request(args: {
    /**
     * @description Creates, signs, and sends a new transaction to the network
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_sendTransaction', params: [{ from: '0x...', to: '0x...', value: '0x...' }] })
     * // => '0x...'
     * */
    method: 'eth_sendTransaction'
    params: [TransactionRequest]
  }): Promise<Data>
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
      Data,
      /** Data to sign */
      Data,
    ]
  }): Promise<Data>
  request(args: {
    /**
     * @description Signs a transaction that can be submitted to the network at a later time using with `eth_sendRawTransaction`
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_signTransaction', params: [{ from: '0x...', to: '0x...', value: '0x...' }] })
     * // => '0x...'
     * */
    method: 'eth_signTransaction'
    params: [
      {
        /** Contract code or a hashed method call with encoded args */
        data?: Data
        /** Transaction sender */
        from: Data
        /** Gas provided for transaction execution */
        gas?: Quantity
        /** Price in wei of each gas used */
        gasPrice?: Quantity
        /** Unique number identifying this transaction */
        nonce?: Quantity
        /** Transaction recipient */
        to?: Data
        /** Value in wei sent with this transaction */
        value?: Quantity
      },
    ]
  }): Promise<Data>
  request(args: {
    /**
     * @description Calculates an Ethereum-specific signature in the form of `keccak256("\x19Ethereum Signed Message:\n" + len(message) + message))`
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_signTypedData', params: [{ from: '0x...', data: [{ type: 'string', name: 'message', value: 'hello world' }] }] })
     * // => '0x...'
     * */
    method: 'eth_signTypedData'
    params: [
      /** Address to use for signing */
      Data,
      /** Message to sign containing type information, a domain separator, and data */
      Data,
    ]
  }): Promise<Data>
  request(args: {
    /**
     * @description Returns information about the status of this client’s network synchronization
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_syncing' })
     * // => { startingBlock: '0x...', currentBlock: '0x...', highestBlock: '0x...' }
     * */
    method: 'eth_syncing'
  }): Promise<NetworkSync | false>
  request(args: {
    /**
     * @description Requests the given permissions from the user.
     * @link https://eips.ethereum.org/EIPS/eip-2255
     * @example
     * provider.request({ method: 'wallet_requestPermissions', params: [{ eth_accounts: {} }] })
     * // => { ... }
     * */
    method: 'wallet_requestPermissions'
    params: [{ eth_accounts: Record<string, any> }]
  }): Promise<WalletPermission[]>
  request(args: {
    /**
     * @description Gets the caller's current permissions.
     * @link https://eips.ethereum.org/EIPS/eip-2255
     * @example
     * provider.request({ method: 'wallet_getPermissions' })
     * // => { ... }
     * */
    method: 'wallet_getPermissions'
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
    params: NativeCurrency[]
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
    params: [{ chainId: string }]
  }): Promise<null>
}

export type InjectedRequests = {
  request(args: {
    /**
     * @description Requests that the user provides an Ethereum address to be identified by. Typically causes a browser extension popup to appear.
     * @link https://eips.ethereum.org/EIPS/eip-1102
     * @example
     * provider.request({ method: 'eth_requestAccounts' }] })
     * // => ['0x...', '0x...']
     * */
    method: 'eth_requestAccounts'
  }): Promise<string[]>
  /**
   * @description Requests that the user tracks the token in the browser extension. Returns a boolean indicating if the token was successfully added.
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
    params: [Data]
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
  }): Promise<string>
  request(args: {
    /**
     * @description Returns a list of addresses owned by this client
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_accounts' })
     * // => ['0x0fB69...']
     * */
    method: 'eth_accounts'
  }): Promise<Data[]>
  request(args: {
    /**
     * @description Returns the number of the most recent block seen by this client
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_blockNumber' })
     * // => '0x1b4'
     * */
    method: 'eth_blockNumber'
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
      {
        /** Transaction sender */
        from?: Data
        /** Transaction recipient or `null` if deploying a contract */
        to: Data | null
        /** Gas provided for transaction execution */
        gas?: Quantity
        /** Price in wei of each gas used */
        gasPrice?: Quantity
        /** Value in wei sent with this transaction */
        value?: Quantity
        /** Contract code or a hashed method call with encoded args */
        data?: Data
      },
      BlockNumber | BlockTime | BlockIdentifier,
    ]
  }): Promise<Data>
  request(args: {
    /**
     * @description Returns the number of the most recent block seen by this client
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_blockNumber' })
     * // => '0x1b4'
     * */
    method: 'eth_blockNumber'
  }): Promise<Quantity>
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
    params: [EstimateGasParameters, BlockNumber | BlockTime]
  }): Promise<Quantity>
  request(args: {
    /**
     * @description Returns the current price of gas expressed in wei
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_gasPrice' })
     * // => '0x09184e72a000'
     * */
    method: 'eth_gasPrice'
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
    params: [Data, BlockNumber | BlockTime | BlockIdentifier]
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
    params: [Data, boolean]
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
    params: [BlockNumber | BlockTime, boolean]
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
    params: [Data]
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
    params: [BlockNumber | BlockTime]
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
    params: [Data, BlockNumber | BlockTime | BlockIdentifier]
  }): Promise<Data>
  request(args: {
    /**
     * @description Returns a list of all logs based on filter ID since the last log retrieval
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_getFilterChanges', params: ['0x...'] })
     * // => [{ ... }, { ... }]
     * */
    method: 'eth_getFilterChanges'
    params: [Quantity]
  }): Promise<Log[]>
  request(args: {
    /**
     * @description Returns a list of all logs based on filter ID
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_getFilterLogs', params: ['0x...'] })
     * // => [{ ... }, { ... }]
     * */
    method: 'eth_getFilterLogs'
    params: [Quantity]
  }): Promise<Log[]>
  request(args: {
    /**
     * @description Returns a list of all logs based on a filter object
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_getLogs', params: [{ ... }] })
     * // => [{ ... }, { ... }]
     * */
    method: 'eth_getLogs'
    params: [
      {
        address?: Data | Data[]
        topics?: Data[]
      } & (
        | {
            fromBlock?: BlockNumber | BlockTime
            toBlock?: BlockNumber | BlockTime
          }
        | {
            blockHash?: Data
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
    params: [Data, Quantity, BlockNumber | BlockTime | BlockIdentifier]
  }): Promise<Log[]>
  request(args: {
    /**
     * @description Returns information about a transaction specified by block hash and transaction index
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_getTransactionByBlockHashAndIndex', params: ['0x...', '0x...'] })
     * // => { ... }
     * */
    method: 'eth_getTransactionByBlockHashAndIndex'
    params: [Data, Quantity]
  }): Promise<TransactionResult | null>
  request(args: {
    /**
     * @description Returns information about a transaction specified by block number and transaction index
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_getTransactionByBlockNumberAndIndex', params: ['0x...', '0x...'] })
     * // => { ... }
     * */
    method: 'eth_getTransactionByBlockNumberAndIndex'
    params: [BlockNumber | BlockTime, Quantity]
  }): Promise<TransactionResult | null>
  request(args: {
    /**
     * @description Returns information about a transaction specified by hash
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_getTransactionByHash', params: ['0x...'] })
     * // => { ... }
     * */
    method: 'eth_getTransactionByHash'
    params: [Data]
  }): Promise<TransactionResult | null>
  request(args: {
    /**
     * @description Returns the number of transactions sent from an address
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_getTransactionCount', params: ['0x...', 'latest'] })
     * // => '0x1'
     * */
    method: 'eth_getTransactionCount'
    params: [Data, BlockNumber | BlockTime | BlockIdentifier]
  }): Promise<TransactionResult | null>
  request(args: {
    /**
     * @description Returns the receipt of a transaction specified by hash
     * @link https://eips.ethereum.org/EIPS/eip-1474
     * @example
     * provider.request({ method: 'eth_getTransactionReceipt', params: ['0x...'] })
     * // => { ... }
     * */
    method: 'eth_getTransactionReceipt'
    params: [Data]
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
    params: [Data, Quantity]
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
    params: [BlockNumber | BlockTime, Quantity]
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
    params: [Data]
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
    params: [BlockNumber | BlockTime]
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
      {
        fromBlock?: BlockNumber | BlockTime
        toBlock?: BlockNumber | BlockTime
        address?: Data | Data[]
        topics?: Data[]
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
  }): Promise<Data>
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
      Quantity,
    ]
  }): Promise<boolean>
}

//////////////////////////////////////////////////

// Injected Flags

export type InjectedFlags = {
  isBraveWallet?: true
  isCoinbaseWallet?: true
  isExodus?: true
  isFrame?: true
  isOpera?: true
  isTally?: true
  isTokenPocket?: true
  isTokenary?: true
  isTrust?: true
} & {
  isMetaMask?: true
  /** Only exists in MetaMask as of 2022/04/03 */
  _events: {
    connect?: () => void
  }
  /** Only exists in MetaMask as of 2022/04/03 */
  _state?: {
    accounts?: string[]
    initialized?: boolean
    isConnected?: boolean
    isPermanentlyDisconnected?: boolean
    isUnlocked?: boolean
  }
}

//////////////////////////////////////////////////
