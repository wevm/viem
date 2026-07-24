import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const metisSepolia = /*#__PURE__*/ Chain.from({
  id: 59902,
  name: 'Metis Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Test Metis',
    symbol: 'tMETIS',
  },
  rpcUrls: {
    http: [
      'https://sepolia.metisdevops.link',
      'https://metis-sepolia-rpc.publicnode.com',
      'https://metis-sepolia.gateway.tenderly.co',
    ],
    ws: 'wss://metis-sepolia-rpc.publicnode.com',
  },
  blockExplorers: {
    name: 'Metis Sepolia Explorer',
    url: 'https://sepolia-explorer.metisdevops.link',
    apiUrl: 'https://sepolia-explorer.metisdevops.link/api-docs',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 224185,
    },
  },
  testnet: true,
})
