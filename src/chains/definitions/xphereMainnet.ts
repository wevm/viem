import * as Chain from '../../core/Chain.js'

export const xphereMainnet = /*#__PURE__*/ Chain.from({
  id: 20250217,
  name: 'Xphere Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'XP',
    symbol: 'XP',
  },
  rpcUrls: {
    http: 'https://en-bkk.x-phere.com',
  },
  blockExplorers: {
    name: 'Xphere Tamsa Explorer',
    url: 'https://xp.tamsa.io',
  },
  testnet: false,
})
