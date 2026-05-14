import { defineChain } from '../../utils/chain/defineChain.js'

export const myrxMainnet = /*#__PURE__*/ defineChain({
  id: 8472,
  name: 'MYRX-MAINNET',
  nativeCurrency: { name: 'MYRX', symbol: 'MYRX', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.myrxwallet.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'MYRX-MAINNET Explorer',
      url: 'https://explorer.myrxwallet.io',
      apiUrl: 'https://explorer.myrxwallet.io/api',
    },
  },
})
