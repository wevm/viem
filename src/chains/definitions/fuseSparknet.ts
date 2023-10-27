import { defineChain } from '../../utils/chain/defineChain.js'

export const fuseSparknet = /*#__PURE__*/ defineChain({
  id: 123,
  name: 'Fuse Sparknet',
  network: 'fuse',
  nativeCurrency: { name: 'Spark', symbol: 'SPARK', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.fusespark.io'] },
    public: { http: ['https://rpc.fusespark.io'] },
  },
  blockExplorers: {
    default: {
      name: 'Sparkent Explorer',
      url: 'https://explorer.fusespark.io',
    },
  },
})
