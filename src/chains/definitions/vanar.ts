import * as Chain from '../../core/Chain.js'

export const vanar = /*#__PURE__*/ Chain.from({
  id: 2040,
  name: 'Vanar Mainnet',
  nativeCurrency: { name: 'VANRY', symbol: 'VANRY', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc.vanarchain.com',
  },
  blockExplorers: {
    name: 'Vanar Mainnet Explorer',
    url: 'https://explorer.vanarchain.com/',
  },
  testnet: false,
})
