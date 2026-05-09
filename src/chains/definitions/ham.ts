import { defineChain } from '../../utils/chain/defineChain.js'

export const ham = /*#__PURE__*/ defineChain({
  id: 5112,
  name: 'Ham',
  nativeCurrency: {
    decimals: 18,
    name: 'Ham',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.ham.fun'],
      webSocket: ['wss://rpc.ham.fun'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Ham Chain Explorer',
      url: 'https://explorer.ham.fun',
      apiUrl: 'https://explorer.ham.fun/api/v2',
    },
  },
})
