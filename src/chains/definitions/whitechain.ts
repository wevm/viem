import { defineChain } from '../../utils/chain/defineChain.js'

export const whitechain = /*#__PURE__*/ defineChain({
  testnet: false,
  name: 'Whitechain',
  blockExplorers: {
    default: {
      name: 'Whitechain Explorer',
      url: 'https://explorer.whitechain.io',
    },
  },
  id: 1875,
  rpcUrls: {
    default: {
      http: ['https://rpc.whitechain.io'],
    },
    public: {
      http: ['https://rpc.whitechain.io'],
    },
  },
  nativeCurrency: {
    decimals: 18,
    name: 'WhiteBIT Coin',
    symbol: 'WBT',
  },
})
