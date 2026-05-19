import * as Chain from '../../core/Chain.js'

export const mchVerse = /*#__PURE__*/ Chain.define({
  id: 29548n,
  name: 'MCH Verse',
  nativeCurrency: { name: 'Oasys', symbol: 'OAS', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.oasys.mycryptoheroes.net'],
    },
  },
  blockExplorers: {
    default: {
      name: 'MCH Verse Explorer',
      url: 'https://explorer.oasys.mycryptoheroes.net',
      apiUrl: 'https://explorer.oasys.mycryptoheroes.net/api',
    },
  },
  testnet: false,
})
