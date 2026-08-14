import { defineChain } from '../../utils/chain/defineChain.js'

export const xgr = /*#__PURE__*/ defineChain({
  id: 1643,
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
