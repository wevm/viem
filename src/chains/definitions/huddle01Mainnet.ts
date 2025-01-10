import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 42_161 // Arbitrum One

export const huddle01Mainnet = /*#__PURE__*/ defineChain({
  id: 12323,
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
