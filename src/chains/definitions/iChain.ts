import { defineChain } from '../../utils/chain/defineChain.js'

export const iChain = /*#__PURE__*/ defineChain({
  id: 3639,
  name: 'iChain Network',
  nativeCurrency: {
    decimals: 18,
    name: 'ISLAMI',
    symbol: 'ISLAMI',
  },
  rpcUrls: {
    default: { http: ['https://rpc.ichainscan.com'] },
  },
  blockExplorers: {
    default: {
      name: 'iChain Scan',
      url: 'https://ichainscan.com/',
    },
  },
})
