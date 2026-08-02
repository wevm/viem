import * as Chain from '../../core/Chain.js'

export const xphereTestnet = /*#__PURE__*/ Chain.from({
  id: 1998991,
  name: 'Xphere Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'XPT',
    symbol: 'XPT',
  },
  rpcUrls: {
    http: 'http://testnet.x-phere.com',
  },
  blockExplorers: {
    name: 'Xphere Tamsa Explorer',
    url: 'https://xpt.tamsa.io',
  },
  testnet: true,
})
