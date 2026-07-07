import { defineChain } from '../../utils/chain/defineChain.js'

export const aere = /*#__PURE__*/ defineChain({
  id: 2800,
  name: 'AERE Network',
  nativeCurrency: {
    decimals: 18,
    name: 'AERE',
    symbol: 'AERE',
  },
  rpcUrls: {
    default: { http: ['https://rpc.aere.network'] },
  },
  blockExplorers: {
    default: {
      name: 'AERE Explorer',
      url: 'https://explorer.aere.network',
    },
  },
})
