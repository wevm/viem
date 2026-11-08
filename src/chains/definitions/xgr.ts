import * as Chain from '../../core/Chain.js'

export const xgr = /*#__PURE__*/ Chain.from({
  id: 1643,
  name: 'XGR Mainnet',
  nativeCurrency: {
    name: 'XGR',
    symbol: 'XGR',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://rpc.xgr.network',
  },
  blockExplorers: {
    name: 'XGR Explorer',
    url: 'https://explorer.xgr.network',
  },
})
