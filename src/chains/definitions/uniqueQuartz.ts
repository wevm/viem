import * as Chain from '../../core/Chain.js'

export const uniqueQuartz = /*#__PURE__*/ Chain.define({
  id: 8881n,
  name: 'Quartz Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'QTZ',
    symbol: 'QTZ',
  },
  rpcUrls: {
    default: { http: ['https://rpc-quartz.unique.network'] },
  },
  blockExplorers: {
    default: {
      name: 'Quartz Subscan',
      url: 'https://quartz.subscan.io/',
    },
  },
})
