import * as Chain from '../../core/Chain.js'

export const yooldoVerseTestnet = /*#__PURE__*/ Chain.from({
  id: 50_006,
  name: 'Yooldo Verse Testnet',
  nativeCurrency: { name: 'OAS', symbol: 'OAS', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.yooldo-verse.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Yooldo Verse Testnet Explorer',
      url: 'https://explorer.testnet.yooldo-verse.xyz',
    },
  },
  testnet: true,
})
