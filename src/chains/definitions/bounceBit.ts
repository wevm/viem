import * as Chain from '../../core/Chain.js'

export const bounceBit = /*#__PURE__*/ Chain.define({
  id: 6001n,
  name: 'BounceBit Mainnet',
  nativeCurrency: { name: 'BounceBit', symbol: 'BB', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://fullnode-mainnet.bouncebitapi.com'] },
  },
  blockExplorers: {
    default: {
      name: 'BB Scan',
      url: 'https://bbscan.io',
    },
  },
  testnet: false,
})
