import { defineChain } from '../../utils/chain/defineChain.js'

export const metis = /*#__PURE__*/ defineChain({
  id: 1_088,
  name: 'Metis',
  network: 'andromeda',
  nativeCurrency: {
    decimals: 18,
    name: 'Metis',
    symbol: 'METIS',
  },
  rpcUrls: {
    default: { http: ['https://andromeda.metis.io/?owner=1088'] },
    public: { http: ['https://andromeda.metis.io/?owner=1088'] },
  },
  blockExplorers: {
    default: {
      name: 'Andromeda Explorer',
      url: 'https://andromeda-explorer.metis.io',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 2338552,
    },
  },
})
