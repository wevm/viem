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
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 2039339,
    },
  },
})
