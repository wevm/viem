import * as Chain from '../../core/Chain.js'

export const shimmerTestnet = /*#__PURE__*/ Chain.from({
  id: 1073,
  name: 'Shimmer Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Shimmer',
    symbol: 'SMR',
  },
  rpcUrls: {
    default: {
      http: ['https://json-rpc.evm.testnet.shimmer.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Shimmer Network Explorer',
      url: 'https://explorer.evm.testnet.shimmer.network',
      apiUrl: 'https://explorer.evm.testnet.shimmer.network/api',
    },
  },
  testnet: true,
})
