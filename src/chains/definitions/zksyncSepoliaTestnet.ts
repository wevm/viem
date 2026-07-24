import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const zksyncSepoliaTestnet = /*#__PURE__*/ Chain.from({
  blockTime: 200,
  id: 300,
  name: 'ZKsync Sepolia Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    http: 'https://sepolia.era.zksync.dev',
    ws: 'wss://sepolia.era.zksync.dev/ws',
  },
  blockExplorers: {
    name: 'ZKsync Explorer',
    url: 'https://sepolia.explorer.zksync.io/',
    blockExplorerApi: 'https://block-explorer-api.sepolia.zksync.dev/api',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xF9cda624FBC7e059355ce98a31693d299FACd963',
    },
    erc6492Verifier: {
      address: '0xfB688330379976DA81eB64Fe4BF50d7401763B9C',
      blockCreated: 3855712,
    },
  },
  testnet: true,
})
