import * as Chain from '../../core/Chain.js'

export const xgrTestnet = /*#__PURE__*/ Chain.from({
  id: 1879,
  name: 'XGR Testnet',
  nativeCurrency: {
    name: 'XGR',
    symbol: 'XGR',
    decimals: 18,
  },
  rpcUrls: {
    http: ['https://rpc1.testnet.xgr.network'],
  },
  blockExplorers: {
    name: 'XGR Testnet Explorer',
    url: 'https://explorer.testnet.xgr.network',
  },
  testnet: true,
})
