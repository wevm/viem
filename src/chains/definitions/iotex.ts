import { defineChain } from '../../utils/chain/defineChain.js'

export const iotex = /*#__PURE__*/ defineChain({
  id: 4_689,
  name: 'IoTeX',
  network: 'iotex',
  nativeCurrency: {
    decimals: 18,
    name: 'IoTeX',
    symbol: 'IOTX',
  },
  rpcUrls: {
    default: {
      http: ['https://babel-api.mainnet.iotex.io'],
      webSocket: ['wss://babel-api.mainnet.iotex.io'],
    },
    public: {
      http: ['https://babel-api.mainnet.iotex.io'],
      webSocket: ['wss://babel-api.mainnet.iotex.io'],
    },
  },
  blockExplorers: {
    default: { name: 'IoTeXScan', url: 'https://iotexscan.io' },
  },
})
