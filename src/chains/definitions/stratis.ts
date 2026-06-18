import * as Chain from '../../core/Chain.js'

export const stratis = /*#__PURE__*/ Chain.from({
  id: 105105,
  name: 'Stratis Mainnet',
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
