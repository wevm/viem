import { defineChain } from '../../utils/chain/defineChain.js'

export const adf = /*#__PURE__*/ defineChain({
  id: 1215,
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
