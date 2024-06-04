import { defineChain } from '../../utils/chain/defineChain.js'

export const bitkub = /*#__PURE__*/ defineChain({
  id: 96,
  name: 'Bitkub',
  nativeCurrency: { name: 'Bitkub', symbol: 'KUB', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.bitkubchain.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Bitkub Chain Mainnet Explorer',
      url: 'https://www.bkcscan.com',
      apiUrl: 'https://www.bkcscan.com/api',
    },
  },
})
