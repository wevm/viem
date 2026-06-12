import { defineChain } from '../../utils/chain/defineChain.js'

export const goChain = /*#__PURE__*/ defineChain({
  id: 60,
  name: 'GoChain',
  nativeCurrency: {
    decimals: 18,
    name: 'GO',
    symbol: 'GO',
  },
  rpcUrls: {
    default: { http: ['https://rpc.gochain.io'] },
  },
  blockExplorers: {
    default: {
      name: 'GoChain Explorer',
      url: 'https://explorer.gochain.io',
    },
  },
  testnet: false,
})
