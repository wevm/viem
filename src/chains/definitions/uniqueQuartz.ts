import { defineChain } from '../../utils/chain/defineChain.js'

export const uniqueQuartz = /*#__PURE__*/ defineChain({
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
