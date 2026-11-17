import * as Chain from '../../core/Chain.js'

export const bounceBitTestnet = /*#__PURE__*/ Chain.from({
  id: 6000,
  name: 'BounceBit Testnet',
  nativeCurrency: { name: 'BounceBit', symbol: 'BB', decimals: 18 },
  rpcUrls: { http: 'https://fullnode-testnet.bouncebitapi.com' },
  blockExplorers: {
    name: 'BB Scan',
    url: 'https://testnet.bbscan.io',
  },
  testnet: true,
})
