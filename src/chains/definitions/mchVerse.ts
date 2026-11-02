import * as Chain from '../../core/Chain.js'

export const mchVerse = /*#__PURE__*/ Chain.from({
  id: 29548,
  name: 'MCH Verse',
  nativeCurrency: { name: 'Oasys', symbol: 'OAS', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc.oasys.mycryptoheroes.net',
  },
  blockExplorers: {
    name: 'MCH Verse Explorer',
    url: 'https://explorer.oasys.mycryptoheroes.net',
    apiUrl: 'https://explorer.oasys.mycryptoheroes.net/api',
  },
  testnet: false,
})
