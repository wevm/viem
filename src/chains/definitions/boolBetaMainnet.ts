import * as Chain from '../../core/Chain.js'

export const boolBetaMainnet = /*#__PURE__*/ Chain.from({
  id: 11100,
  name: 'Bool Beta Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'BOL',
    symbol: 'BOL',
  },
  rpcUrls: { http: 'https://beta-rpc-node-http.bool.network' },
  blockExplorers: {
    name: 'BoolScan',
    url: 'https://beta-mainnet.boolscan.com/',
  },
  testnet: false,
})
