import { defineChain } from '../../utils/chain/defineChain.js'

export const degen = /*#__PURE__*/ defineChain({
  id: 666666666,
  name: 'Degen',
  nativeCurrency: {
    decimals: 18,
    name: 'Degen',
    symbol: 'DEGEN',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.degen.tips'],
      webSocket: ['wss://rpc.degen.tips'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Degen Chain Explorer',
      url: 'https://explorer.degen.tips',
      apiUrl: 'https://explorer.degen.tips/api/v2',
    },
  },
})
