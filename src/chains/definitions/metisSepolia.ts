import * as Chain from '../../core/Chain.js'

export const metisSepolia = /*#__PURE__*/ Chain.define({
  id: 59902n,
  name: 'Metis Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Test Metis',
    symbol: 'tMETIS',
  },
  rpcUrls: {
    default: {
      http: [
        'https://sepolia.metisdevops.link',
        'https://metis-sepolia-rpc.publicnode.com',
        'https://metis-sepolia.gateway.tenderly.co',
      ],
      webSocket: ['wss://metis-sepolia-rpc.publicnode.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Metis Sepolia Explorer',
      url: 'https://sepolia-explorer.metisdevops.link',
      apiUrl: 'https://sepolia-explorer.metisdevops.link/api-docs',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 224185,
    },
  },
  testnet: true,
})
