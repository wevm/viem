import { defineChain } from '../../utils/chain/defineChain.js'

export const kroma = /*#__PURE__*/ defineChain({
  id: 255,
  name: 'Kroma',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://api.kroma.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Kroma Explorer',
      url: 'https://blockscout.kroma.network',
      apiUrl: 'https://blockscout.kroma.network/api',
    },
  },
  testnet: false,
})
