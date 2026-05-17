import { defineChain } from '../../utils/chain/defineChain.js'

export const arc = /*#__PURE__*/ defineChain({
  id: 5042,
  name: 'Arc',
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [],
    },
  },
})
