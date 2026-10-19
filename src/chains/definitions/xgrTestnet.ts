import { defineChain } from '../../utils/chain/defineChain.js'

export const xgrTestnet = /*#__PURE__*/ defineChain({
  id: 1879,
  name: 'XGR Testnet',
  nativeCurrency: {
    name: 'XGR',
    symbol: 'XGR',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc1.testnet.xgr.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'XGR Testnet Explorer',
      url: 'https://explorer.testnet.xgr.network',
    },
  },
  testnet: true,
})
