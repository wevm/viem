import { defineChain } from '../../utils/chain/defineChain.js'

export const luxeports = /*#__PURE__*/ defineChain({
  id: 1122,
  name: 'LuxePorts Network',
  nativeCurrency: {
    decimals: 18,
    name: 'LuxePorts',
    symbol: 'LXP',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.luxeports.com'],
      webSocket: ['wss://rpc.luxeports.com/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'LuxePorts Explorer',
      url: 'https://explorer.luxeports.com',
    },
  },
})