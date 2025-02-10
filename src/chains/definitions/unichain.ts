import { defineChain } from '../../utils/chain/defineChain.js'

export const unichain = /*#__PURE__*/ defineChain({
  id: 130,
  name: 'Unichain',
  nativeCurrency: { name: 'Unichain', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet.unichain.org/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Uniscan',
      url: 'https://uniscan.xyz',
      apiUrl: 'https://api.uniscan.xyz/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 0,
    },
  },
})
