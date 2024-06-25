import { defineChain } from '../../utils/chain/defineChain.js'

export const morphHolesky = /*#__PURE__*/ defineChain({
  id: 2810,
  name: 'Morph Holesky',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc-quicknode-holesky.morphl2.io'],
      webSocket: ['wss://rpc-quicknode-holesky.morphl2.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Morph Holesky Explorer',
      url: 'https://explorer-holesky.morphl2.io',
      apiUrl: 'https://explorer-api-holesky.morphl2.io/api?',
    },
  },
  testnet: true,
})
