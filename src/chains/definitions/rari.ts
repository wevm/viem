import { defineChain } from '../../utils/chain/defineChain.js'

export const rari = /*#__PURE__*/ defineChain({
  id: 1_380_012_617,
  name: 'RARI Chain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet.rpc.rarichain.org/http'],
    },
  },
  blockExplorers: {
    default: {
      name: 'RARI chain explorer',
      url: 'https://mainnet.explorer.rarichain.org/',
      apiUrl: 'https://mainnet.explorer.rarichain.org/api',
    },
  },
  contracts: {},
})
