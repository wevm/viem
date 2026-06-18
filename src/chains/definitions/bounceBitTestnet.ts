import * as Chain from '../../core/Chain.js'

export const bounceBitTestnet = /*#__PURE__*/ Chain.from({
  id: 6000,
  name: 'BounceBit Testnet',
  nativeCurrency: { name: 'BounceBit', symbol: 'BB', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://fullnode-testnet.bouncebitapi.com'] },
  },
  blockExplorers: {
    default: {
      name: 'BB Scan',
      url: 'https://testnet.bbscan.io',
    },
  },
  testnet: true,
})
