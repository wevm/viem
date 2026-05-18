import { defineChain } from '../../utils/chain/defineChain.js'

export const humanityTestnet = /*#__PURE__*/ defineChain({
  id: 7_080_969,
  name: 'Humanity Testnet',
  nativeCurrency: {
    name: 'tHP',
    symbol: 'tHP',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.humanity.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Humanity Testnet Explorer',
      url: 'https://humanity-testnet.explorer.alchemy.com',
      apiUrl: 'https://humanity-testnet.explorer.alchemy.com/api',
    },
  },
  testnet: true,
})
