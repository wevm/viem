import { defineChain } from '../../utils/chain/defineChain.js'

export const boba = /*#__PURE__*/ defineChain({
  id: 288,
  name: 'Boba Network',
  nativeCurrency: {
    decimals: 18,
    name: 'Boba',
    symbol: 'BOBA',
  },
  rpcUrls: {
    default: { http: ['https://mainnet.boba.network'] },
  },
  blockExplorers: {
    default: {
      name: 'BOBAScan',
      url: 'https://bobascan.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 446859,
    },
  },
})
