import { defineChain } from '../../utils/chain/defineChain.js'

export const shimmerTestnet = /*#__PURE__*/ defineChain({
  id: 1073,
  name: 'Shimmer Testnet',
  network: 'shimmer-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Shimmer',
    symbol: 'SMR',
  },
  rpcUrls: {
    public: {
      http: ['https://json-rpc.evm.testnet.shimmer.network'],
    },
    default: {
      http: ['https://json-rpc.evm.testnet.shimmer.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Shimmer Network Explorer',
      url: 'https://explorer.evm.testnet.shimmer.network',
    },
  },
  testnet: true,
})
