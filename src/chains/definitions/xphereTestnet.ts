import * as Chain from '../../core/Chain.js'

export const xphereTestnet = /*#__PURE__*/ Chain.define({
  id: 1998991n,
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
