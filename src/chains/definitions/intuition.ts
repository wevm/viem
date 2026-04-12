import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 8453

export const intuition = /*#__PURE__*/ defineChain({
  id: 1155,
  name: 'Intuition',
  nativeCurrency: {
    decimals: 18,
    name: 'TRUST',
    symbol: 'TRUST',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.intuition.systems'],
      webSocket: ['wss://rpc.intuition.systems'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Intuition Explorer',
      url: 'https://explorer.intuition.systems',
    },
  },
  sourceId,
})
