import { defineChain } from '../../utils/chain/defineChain.js'

export const omax = /*#__PURE__*/ defineChain({
  id: 311,
  name: 'Omax Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'OMAX',
    symbol: 'OMAX',
  },
  rpcUrls: {
    default: { http: ['https://mainapi.omaxray.com'] },
  },
  blockExplorers: {
    default: {
      name: 'Omax Explorer',
      url: 'https://omaxscan.com',
    },
  },
  testnet: false,
})
