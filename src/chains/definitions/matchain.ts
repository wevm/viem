import { defineChain } from '../../utils/chain/defineChain.js'

export const matchain = /*#__PURE__*/ defineChain({
  id: 698,
  name: 'Matchain',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://rpc.matchain.io'] },
  },
  blockExplorers: {
    default: {
      name: 'Matchain Scan',
      url: 'https://matchscan.io',
    },
  },
})
