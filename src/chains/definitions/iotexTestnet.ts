import { defineChain } from '../../utils/chain/defineChain.js'

export const iotexTestnet = /*#__PURE__*/ defineChain({
  id: 4_690,
  name: 'IoTeX Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'IoTeX',
    symbol: 'IOTX',
  },
  rpcUrls: {
    default: {
      http: ['https://babel-api.testnet.iotex.io'],
      webSocket: ['wss://babel-api.testnet.iotex.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'IoTeXScan',
      url: 'https://testnet.iotexscan.io',
    },
  },
  testnet: true,
})
