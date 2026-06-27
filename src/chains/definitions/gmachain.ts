import { defineChain } from '../../utils/chain/defineChain.js'

export const gmachain = /*#__PURE__*/ defineChain({
  id: 4189,
  name: 'GMAChain',
  nativeCurrency: { name: 'GMA', symbol: 'GMA', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://api.gmachain.xyz'],
      webSocket: ['wss://api.gmachain.xyz/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'GMAChain Explorer',
      url: 'https://gmachain.xyz',
    },
  },
})
