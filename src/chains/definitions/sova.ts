import * as Chain from '../../core/Chain.js'

export const sova = /*#__PURE__*/ Chain.from({
  id: 100_021,
  name: 'Sova',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.sova.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Sova Block Explorer',
      url: 'https://explorer.sova.io',
    },
  },
  testnet: false,
})
