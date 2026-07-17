import * as Chain from '../../core/Chain.js'

export const loadAlphanet = /*#__PURE__*/ Chain.from({
  id: 9496,
  name: 'Load Alphanet',
  nativeCurrency: { name: 'Testnet LOAD', symbol: 'tLOAD', decimals: 18 },
  rpcUrls: { http: 'https://alphanet.load.network' },
  blockExplorers: {
    name: 'Load Alphanet Explorer',
    url: 'https://explorer.load.network',
  },
  testnet: true,
})
