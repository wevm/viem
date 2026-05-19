import * as Chain from '../../core/Chain.js'

export const loadAlphanet = /*#__PURE__*/ Chain.define({
  id: 9496n,
  name: 'Load Alphanet',
  nativeCurrency: { name: 'Testnet LOAD', symbol: 'tLOAD', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://alphanet.load.network'] },
  },
  blockExplorers: {
    default: {
      name: 'Load Alphanet Explorer',
      url: 'https://explorer.load.network',
    },
  },
  testnet: true,
})
