import { defineChain } from '../../utils/chain/defineChain.js'

export const xphereTestnet = /*#__PURE__*/ defineChain({
  id: 1998991,
  name: 'Xphere Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'XPT',
    symbol: 'XPT',
  },
  rpcUrls: {
    default: {
      http: ['http://testnet.x-phere.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Xphere Tamsa Explorer',
      url: 'https://xpt.tamsa.io',
    },
  },
  testnet: true,
})
