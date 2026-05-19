import * as Chain from '../../core/Chain.js'

export const boolBetaMainnet = /*#__PURE__*/ Chain.define({
  id: 11100n,
  name: 'Bool Beta Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'BOL',
    symbol: 'BOL',
  },
  rpcUrls: {
    default: { http: ['https://beta-rpc-node-http.bool.network'] },
  },
  blockExplorers: {
    default: {
      name: 'BoolScan',
      url: 'https://beta-mainnet.boolscan.com/',
    },
  },
  testnet: false,
})
