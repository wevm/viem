import * as Chain from '../../core/Chain.js'

const sourceId = 421_614n // Arbitrum Sepolia

export const huddle01Testnet = /*#__PURE__*/ Chain.define({
  id: 2524852n,
  name: 'Huddle01 dRTC Chain Testnet',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://huddle-testnet.rpc.caldera.xyz/http'],
      webSocket: ['wss://huddle-testnet.rpc.caldera.xyz/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Huddle01 Caldera Explorer',
      url: 'https://huddle-testnet.explorer.caldera.xyz',
      apiUrl: 'https://huddle-testnet.explorer.caldera.xyz/api',
    },
  },
  sourceId,
  testnet: true,
})
