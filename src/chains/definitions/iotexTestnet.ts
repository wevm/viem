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
  contracts: {
    multicall3: {
      address: '0xb5cecD6894c6f473Ec726A176f1512399A2e355d',
      blockCreated: 24347592,
    },
  },
  testnet: true,
})
