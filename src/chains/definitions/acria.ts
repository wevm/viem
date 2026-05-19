import * as Chain from '../../core/Chain.js'

export const acria = /*#__PURE__*/ Chain.define({
  id: 47n,
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
