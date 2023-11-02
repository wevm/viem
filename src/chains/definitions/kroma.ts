import { defineChain } from '../../utils/chain/defineChain.js'

export const kroma = /*#__PURE__*/ defineChain({
  id: 255,
  network: 'kroma',
  name: 'Kroma',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://api.kroma.network'],
    },
    public: {
      http: ['https://api.kroma.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Kroma Explorer',
      url: 'https://blockscout.kroma.network',
    },
  },
  testnet: false,
})
