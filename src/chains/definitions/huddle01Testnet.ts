import * as Chain from '../../core/Chain.js'

const sourceId = 421_614 // Arbitrum Sepolia

export const huddle01Testnet = /*#__PURE__*/ Chain.from({
  id: 2524852,
  name: 'Huddle01 dRTC Chain Testnet',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://huddle-testnet.rpc.caldera.xyz/http',
    ws: 'wss://huddle-testnet.rpc.caldera.xyz/ws',
  },
  blockExplorers: {
    name: 'Huddle01 Caldera Explorer',
    url: 'https://huddle-testnet.explorer.caldera.xyz',
    apiUrl: 'https://huddle-testnet.explorer.caldera.xyz/api',
  },
  sourceId,
  testnet: true,
})
