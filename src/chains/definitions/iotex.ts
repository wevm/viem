import { defineChain } from '../../utils/chain/defineChain.js'

export const iotex = /*#__PURE__*/ defineChain({
  id: 4_689,
  name: 'IoTeX',
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
  },
  blockExplorers: {
    default: {
      name: 'IoTeXScan',
      url: 'https://iotexscan.io',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 22163670,
    },
  },
})
