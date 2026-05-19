import * as Chain from '../../core/Chain.js'

export const stratis = /*#__PURE__*/ Chain.define({
  id: 105105n,
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
