import { defineChain } from '../../utils/chain/defineChain.js'

export const redbellyTestnet = /*#__PURE__*/ defineChain({
  id: 153,
  name: 'Redbelly Network Testnet',
  nativeCurrency: {
    name: 'Redbelly Native Coin',
    symbol: 'RBNT',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://governors.testnet.redbelly.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Routescan',
      url: 'https://redbelly.testnet.routescan.io/',
      apiUrl: 'https://redbelly.testnet.routescan.io/api',
    },
  },
  testnet: true,
})
