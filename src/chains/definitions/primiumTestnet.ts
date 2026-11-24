import { defineChain } from '../../utils/chain/defineChain.js'

export const primiumTestnet = /*#__PURE__*/ defineChain({
  id: 1_234_571,
  name: 'Primium Testnet',
  nativeCurrency: { name: 'DEX', symbol: 'DEX', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://node1-testnet.codexnetwork.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Primium Explorer',
      url: 'https://explorer-testnet.codexnetwork.org',
      apiUrl: 'https://explorer-testnet.codexnetwork.org/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 1_411_449,
    },
  },
  testnet: true,
})
