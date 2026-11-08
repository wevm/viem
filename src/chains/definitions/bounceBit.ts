import * as Chain from '../../core/Chain.js'

export const bounceBit = /*#__PURE__*/ Chain.from({
  id: 6001,
  name: 'BounceBit Mainnet',
  nativeCurrency: { name: 'BounceBit', symbol: 'BB', decimals: 18 },
  rpcUrls: { http: 'https://fullnode-mainnet.bouncebitapi.com' },
  blockExplorers: {
    name: 'BB Scan',
    url: 'https://bbscan.io',
  },
  testnet: false,
})
