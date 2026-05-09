import { defineChain } from '../../utils/chain/defineChain.js'

export const dosChain = /*#__PURE__*/ defineChain({
  id: 7979,
  name: 'DOS Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'DOS Chain',
    symbol: 'DOS',
  },
  rpcUrls: {
    default: { http: ['https://main.doschain.com'] },
  },
  blockExplorers: {
    default: {
      name: 'DOS Chain Explorer',
      url: 'https://doscan.io',
      apiUrl: 'https://api.doscan.io',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 161908,
    },
  },
})
