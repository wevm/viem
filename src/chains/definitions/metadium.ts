import * as Chain from '../../core/Chain.js'

export const metadium = /*#__PURE__*/ Chain.define({
  id: 11n,
  name: 'Metadium Network',
  nativeCurrency: {
    decimals: 18,
    name: 'META',
    symbol: 'META',
  },
  rpcUrls: {
    default: { http: ['https://api.metadium.com/prod'] },
  },
  blockExplorers: {
    default: {
      name: 'Metadium Explorer',
      url: 'https://explorer.metadium.com',
    },
  },
  testnet: false,
})
