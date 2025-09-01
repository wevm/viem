import { defineChain } from '../../utils/chain/defineChain.js'

export const eteria = /*#__PURE__*/ defineChain({
  id: 140,
  name: 'Eteria',
  nativeCurrency: { name: 'Eteria', symbol: 'ERA', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet.eteria.io/v1'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Eteria Explorer',
      url: 'https://explorer.eteria.io',
      apiUrl: 'https://explorer.eteria.io/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 7654707,
    },
  },
})
