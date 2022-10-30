### Providers

- Base Provider
  - RPC Request Implementation (`rpc.ts`)
    - Queue support
    - Cache deterministic responses? i.e. `eth_call` responses
- Network Providers
  - Provider Types
    - HTTP
    - WebSocket
  - Custom Request
  - Connection Details
  - Realtime?
    - Websockets
    - Polling
- Wallet Providers
  - Provider Types
    - Injected
    - External (JavaScript API – e.g. WalletConnect, Coinbase Wallet SDK, etc)
  - Wallet Event Listeners
- Account Provider
- Fallback Provider
  - Quorum support
  - Offline/unresponsive provider fallbacks
- Misc
  - Global Event Listeners (block, transactions, etc)
  - Transaction Confirmations
  - CCIP Read
  - ENS Universal Resolver

### Actions

- Public
  - Addresses
    - `fetchBalance` (eth_getBalance)
    - `fetchCode` (eth_getCode)
    - `fetchStorageAt` (eth_getStorageAt)
  - Blocks
    - `fetchBlock` (eth_getBlockByNumber, eth_getBlockByHash)
    - `fetchBlockNumber` (eth_blockNumber)
    - `fetchBlockTransactionCount` (eth_getBlockTransactionCountByHash, eth_getBlockTransactionCountByNumber)
  - Chains
    - `fetchChain` (net_version)
  - Contracts
    - `getContract`
    - `readContract`
    - `writeContract`
  - Client
    - `fetchClientVersion` (web3_clientVersion)
    - `fetchListeningStatus` (net_listening)
    - `fetchPeerCount` (net_peerCount)
  - ENS
    - `fetchEnsAddress`
    - `fetchEnsAvatar`
    - `fetchEnsCoinAddress`
    - `fetchEnsContent`
    - `fetchEnsCover`
    - `fetchEnsName`
    - `fetchEnsResolver`
    - `fetchEnsTextRecord`
  - Filters
    - `createBlockFilter` (eth_newBlockFilter)
    - `createFilter` (eth_newFilter)
    - `createPendingTransactionFilter` (eth_newPendingTransactionFilter)
    - `fetchFilterChanges` (eth_getFilterChanges)
    - `uninstallFilter` (eth_uninstallFilter)
  - Logs
    - `fetchFilterLogs` (eth_getFilterLogs)
    - `fetchLogs` (eth_getLogs)
  - Gas
    - `fetchGasEstimate` (eth_estimateGas)
    - `fetchGasPrice` (eth_gasPrice)
  - Transactions
    - `call` (eth_call)
    - `fetchTransaction` (eth_getTransactionByBlockHashAndIndex, eth_getTransactionByBlockNumberAndIndex, eth_getTransactionByHash)
    - `fetchTransactionCount` (eth_getTransactionCount)
    - `fetchTransactionReceipt` (eth_getTransactionReceipt)
    - `prepareTransaction` (`fetchGasEstimate`, resolve ENS, etc)
    - `sendRawTransaction` (eth_sendRawTransaction)
  - Uncles
    - `fetchUncle` (eth_getUncleByBlockHashAndIndex, eth_getUncleByBlockNumberAndIndex)
    - `fetchUncleCount` (eth_getUncleCountByBlockHash, eth_getUncleCountByBlockNumber)
  - `fetchProtocolVersion` (eth_protocolVersion)
- Account
  - Chains
    - `addEthereumChain`
    - `switchEthereumChain`
  - Data
    - `signMessage`
    - `signTypedData`
  - Permissions
    - `fetchPermissions`
    - `requestPermissions`
  - Transactions
    - `sendTransaction`
    - `signTransaction`
- Wallet
  - Accounts
    - `fetchAccounts` (eth_accounts)
    - `requestAccounts` (eth_requestAccounts)
  - Assets
    - `watchAsset` (wallet_watchAsset)

### Chains

- Chain API
  - Are we happy with the current API?
  - Should we design an API for extensible contract addresses
    - multicall, UniversalResolver, perhaps there will be more?

### Contracts

- ABI
  - Function Data
    - Encoding
    - Decoding
  - Function Response
    - Encoding
    - Decoding
- Contract Event Listeners
- probs more...

### Wallets

TBD
