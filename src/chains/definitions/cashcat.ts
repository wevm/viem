import { defineChain } from '../../utils/chain/defineChain.js'

export const cashcat = /*#__PURE__*/ defineChain({
  id: 2_274_228,
  name: 'CashCat Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'Cash Cat',
    symbol: 'CASHCAT',
  },
  rpcUrls: {
    default: { http: ['https://rpc.cashcat.network'] },
  },
  blockExplorers: {
    default: {
      name: 'CashCat Explorer',
      url: 'https://explorer.cashcat.network',
      apiUrl: 'https://explorer.cashcat.network/api',
    },
  },
})
