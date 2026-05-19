import * as Chain from '../../core/Chain.js'

const sourceId = 42_161n // Arbitrum One

export const huddle01Mainnet = /*#__PURE__*/ Chain.define({
  id: 12323n,
  name: 'Huddle01 dRTC Chain',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://huddle01.calderachain.xyz/http'],
      webSocket: ['wss://huddle01.calderachain.xyz/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Huddle01 Caldera Explorer',
      url: 'https://huddle01.calderaexplorer.xyz',
      apiUrl: 'https://huddle01.calderaexplorer.xyz/api',
    },
  },
  sourceId,
})
