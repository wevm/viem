import { defineChain } from '../../utils/chain/defineChain.js'

export const acria = /*#__PURE__*/ defineChain({
  id: 47,
  name: 'Acria IntelliChain',
  nativeCurrency: {
    decimals: 18,
    name: 'ACRIA',
    symbol: 'ACRIA',
  },
  rpcUrls: {
    default: {
      http: ['https://aic.acria.ai'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Acria Explorer',
      url: 'https://explorer.acria.ai',
    },
  },
  testnet: false,
})
