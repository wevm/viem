import * as Chain from '../../core/Chain.js'

export const zksyncSepoliaTestnet = /*#__PURE__*/ Chain.define({
  blockTime: 200,
  id: 300n,
  name: 'ZKsync Sepolia Testnet',
  network: 'zksync-sepolia-testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://sepolia.era.zksync.dev'],
      webSocket: ['wss://sepolia.era.zksync.dev/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'ZKsync Explorer',
      url: 'https://sepolia.explorer.zksync.io/',
      blockExplorerApi: 'https://block-explorer-api.sepolia.zksync.dev/api',
    },
  },
  contracts: {
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
