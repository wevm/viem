import { defineChain } from '../../utils/chain/defineChain.js'

export const luxeports = /*#__PURE__*/ defineChain({
  id: 1122,
  name: 'LuxePorts',
  network: 'luxeports',
  nativeCurrency: {
    name: 'LuxePorts',
    symbol: 'LXP',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.luxeports.com', 'https://erpc.luxeports.com'],
      webSocket: ['wss://rpc.luxeports.com/ws', 'wss://erpc.luxeports.com/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'LXPScan',
      url: 'https://lxpscan.com',
    },
  },
  testnet: false,
})
