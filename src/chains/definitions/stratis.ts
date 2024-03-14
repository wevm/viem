import { defineChain } from '../../utils/chain/defineChain.js'

export const stratis = /*#__PURE__*/ defineChain({
  id: 105105,
  name: 'Stratis Mainnet',
  network: 'stratis',
  nativeCurrency: {
    name: 'Stratis',
    symbol: 'STRAX',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.stratisevm.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Stratis Explorer',
      url: 'https://explorer.stratisevm.com',
    },
  },
})
