import * as Chain from '../../core/Chain.js'

export const vanar = /*#__PURE__*/ Chain.define({
  id: 2040n,
  name: 'Vanar Mainnet',
  nativeCurrency: { name: 'VANRY', symbol: 'VANRY', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.vanarchain.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Vanar Mainnet Explorer',
      url: 'https://explorer.vanarchain.com/',
    },
  },
  testnet: false,
})
