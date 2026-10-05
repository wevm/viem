import * as Chain from '../../core/Chain.js'

export const adf = /*#__PURE__*/ Chain.from({
  id: 1215,
  name: 'ADF Chain',
  nativeCurrency: { name: 'ADDFILL', symbol: 'ADF', decimals: 18 },
  rpcUrls: {
    http: 'https://mainnet.adftechnology.com',
  },
  blockExplorers: {
    name: 'ADF Mainnet Explorer',
    url: 'https://explorer.adftechnology.com',
  },
  testnet: false,
})
