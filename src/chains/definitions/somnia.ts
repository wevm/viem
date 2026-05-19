import * as Chain from '../../core/Chain.js'

export const somnia = /*#__PURE__*/ Chain.define({
  id: 5031n,
  name: 'Somnia',
  nativeCurrency: { name: 'Somnia', symbol: 'SOMI', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://api.infra.mainnet.somnia.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Somnia Explorer',
      url: 'https://explorer.somnia.network',
      apiUrl: 'https://explorer.somnia.network/api',
    },
  },
  testnet: false,
})
