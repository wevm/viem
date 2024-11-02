import { defineChain } from '../../utils/chain/defineChain.js'

export const zeniq = /*#__PURE__*/ defineChain({
  id: 383414847825,
  name: 'Zeniq Mainnet',
  nativeCurrency: { name: 'ZENIQ', symbol: 'ZENIQ', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://api.zeniq.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Zeniq Explorer',
      url: 'https://zeniqscan.com',
    },
  },
  testnet: false,
})
