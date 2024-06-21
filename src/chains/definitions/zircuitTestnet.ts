import { defineChain } from '../../utils/chain/defineChain.js'

export const zircuitTestnet = /*#__PURE__*/ defineChain({
  id: 48899,
  name: 'Zircuit Testnet',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://zircuit1.p2pify.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Zircuit Explorer',
      url: 'https://explorer.zircuit.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 6040287,
    },
  },
})
