import * as Chain from '../../core/Chain.js'

export const humanityTestnet = /*#__PURE__*/ Chain.define({
  id: 7_080_969n,
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
