import { defineChain } from '../../utils/chain/defineChain.js'

export const artheraTestnet = /*#__PURE__*/ defineChain({
  id: 10243,
  name: 'Arthera Testnet',
  nativeCurrency: { name: 'Arthera', symbol: 'AA', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc-test.arthera.net'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Arthera EVM Explorer',
      url: 'https://explorer-test.arthera.net',
      apiUrl: 'https://explorer-test.arthera.net/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 22051,
    },
  },
})
