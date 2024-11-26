import { defineChain } from '../../utils/chain/defineChain.js'

export const redbelly = /*#__PURE__*/ defineChain({
  id: 151,
  name: 'Redbelly Network Mainnet',
  nativeCurrency: { name: 'Redbelly Native Coin', symbol: 'RBNT', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://governors.mainnet.redbelly.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Routescan',
      url: 'https://redbelly.routescan.io/',
      apiUrl: 'https://redbelly.routescan.io/api',
    },
  },
  testnet: false,
})
