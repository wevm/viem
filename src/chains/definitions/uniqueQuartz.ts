import * as Chain from '../../core/Chain.js'

export const uniqueQuartz = /*#__PURE__*/ Chain.from({
  id: 8881,
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
