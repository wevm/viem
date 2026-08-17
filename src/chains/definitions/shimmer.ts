import * as Chain from '../../core/Chain.js'

export const shimmer = /*#__PURE__*/ Chain.from({
  id: 148,
  name: 'Shimmer',
  nativeCurrency: {
    decimals: 18,
    name: 'Shimmer',
    symbol: 'SMR',
  },
  rpcUrls: {
    http: 'https://json-rpc.evm.shimmer.network',
  },
  blockExplorers: {
    name: 'Shimmer Network Explorer',
    url: 'https://explorer.evm.shimmer.network',
    apiUrl: 'https://explorer.evm.shimmer.network/api',
  },
})
