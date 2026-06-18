import * as Chain from '../../core/Chain.js'

export const yooldoVerse = /*#__PURE__*/ Chain.from({
  id: 50_005,
  name: 'Yooldo Verse',
  nativeCurrency: { name: 'OAS', symbol: 'OAS', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.yooldo-verse.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Yooldo Verse Explorer',
      url: 'https://explorer.yooldo-verse.xyz',
    },
  },
})
