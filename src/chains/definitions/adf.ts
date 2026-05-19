import * as Chain from '../../core/Chain.js'

export const adf = /*#__PURE__*/ Chain.define({
  id: 1215n,
  name: 'ADF Chain',
  nativeCurrency: { name: 'ADDFILL', symbol: 'ADF', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet.adftechnology.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'ADF Mainnet Explorer',
      url: 'https://explorer.adftechnology.com',
    },
  },
  testnet: false,
})
