import * as Chain from '../../core/Chain.js'

export const metadium = /*#__PURE__*/ Chain.from({
  id: 11,
  name: 'Metadium Network',
  nativeCurrency: {
    decimals: 18,
    name: 'META',
    symbol: 'META',
  },
  rpcUrls: { http: 'https://api.metadium.com/prod' },
  blockExplorers: {
    name: 'Metadium Explorer',
    url: 'https://explorer.metadium.com',
  },
  testnet: false,
})
