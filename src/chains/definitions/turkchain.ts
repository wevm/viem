import { defineChain } from '../../utils/chain/defineChain.js'

export const turkchain = /*#__PURE__*/ defineChain({
  id: 1919,
  name: 'Turkchain',
  nativeCurrency: {
    decimals: 18,
    name: 'TC',
    symbol: 'TURK',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.turkscan.com'],
      webSocket: ['wss://evm-ws.turkscan.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'TurkScan',
      url: 'https://turkscan.com',
    },
  },
})
