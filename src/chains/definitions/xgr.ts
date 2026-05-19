import * as Chain from '../../core/Chain.js'

export const xgr = /*#__PURE__*/ Chain.define({
  id: 1643n,
  name: 'XGR Mainnet',
  nativeCurrency: {
    name: 'XGR',
    symbol: 'XGR',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.xgr.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'XGR Explorer',
      url: 'https://explorer.xgr.network',
    },
  },
})
