import { defineChain } from '../../utils/chain/defineChain.js'

export const aurora = /*#__PURE__*/ defineChain({
  id: 1313161554,
  name: 'Aurora',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://mainnet.aurora.dev'] },
  },
  blockExplorers: {
    default: {
      name: 'Aurorascan',
      url: 'https://aurorascan.dev',
      apiUrl: 'https://aurorascan.dev/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 62907816,
    },
  },
})
