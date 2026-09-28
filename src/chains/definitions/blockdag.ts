import { defineChain } from '../../utils/chain/defineChain.js'

export const blockdag = /*#__PURE__*/ defineChain({
  id: 1404,
  name: 'BlockDAG',
  nativeCurrency: {
    decimals: 18,
    name: 'BlockDAG',
    symbol: 'BDAG',
  },
  rpcUrls: {
    default: { http: ['https://rpc.bdagexplorer.com/'] },
  },
  blockExplorers: {
    default: {
      name: 'BDAG Explorer',
      url: 'https://explorer.bdagexplorer.com',
    },
  },
})
