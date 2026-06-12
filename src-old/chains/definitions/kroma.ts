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
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 16054868,
    },
  },
  testnet: false,
})
