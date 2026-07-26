import { defineChain } from '../../utils/chain/defineChain.js'

export const fem = /*#__PURE__*/ defineChain({
  id: 23124,
  name: 'Fem',
  blockTime: 2000,
  nativeCurrency: { name: 'Fem', symbol: 'FEM', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://femchain.up.railway.app'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Fem Explorer',
      url: 'https://explorer.fem.network',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 1,
    },
  },
})
