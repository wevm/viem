import { defineChain } from '../../utils/chain/defineChain.js'

export const somnia = /*#__PURE__*/ defineChain({
  id: 5031,
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
