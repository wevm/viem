import { defineChain } from '../../utils/chain/defineChain.js'

export const shimmer = /*#__PURE__*/ defineChain({
  id: 148,
  name: 'Shimmer',
  network: 'shimmer',
  nativeCurrency: {
    decimals: 18,
    name: 'Shimmer',
    symbol: 'SMR',
  },
  rpcUrls: {
    default: {
      http: ['https://json-rpc.evm.shimmer.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Shimmer Network Explorer',
      url: 'https://explorer.evm.shimmer.network',
      apiUrl: 'https://explorer.evm.shimmer.network/api',
    },
  },
})
