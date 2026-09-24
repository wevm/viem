import { defineChain } from '../../utils/chain/defineChain.js'

export const candyChain = /*#__PURE__*/ defineChain({
  id: 2828,
  name: 'CandyChain',
  nativeCurrency: {
    decimals: 18,
    name: 'CANDY',
    symbol: 'CANDY',
  },
  rpcUrls: {
    default: { http: ['https://publicrpc.candychain.io'] },
  },
  blockExplorers: {
    default: {
      name: 'CandyChain Explorer',
      url: 'https://streams.candychain.io',
    },
  },
})
