import { defineChain } from '../../utils/chain/defineChain.js'

export const bsquared = /*#__PURE__*/ defineChain({
  id: 223,
  name: 'B2',
  nativeCurrency: {
    name: 'Bitcoin',
    symbol: 'BTC',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.bsquared.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'blockscout',
      url: 'https://explorer.bsquared.network',
    },
  },
})
