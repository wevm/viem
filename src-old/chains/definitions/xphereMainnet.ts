import { defineChain } from '../../utils/chain/defineChain.js'

export const xphereMainnet = /*#__PURE__*/ defineChain({
  id: 20250217,
  name: 'Xphere Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'XP',
    symbol: 'XP',
  },
  rpcUrls: {
    default: {
      http: ['https://en-bkk.x-phere.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Xphere Tamsa Explorer',
      url: 'https://xp.tamsa.io',
    },
  },
  testnet: false,
})
