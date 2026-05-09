import { defineChain } from '../../utils/chain/defineChain.js'

export const fuseSparknet = /*#__PURE__*/ defineChain({
  id: 123,
  name: 'Fuse Sparknet',
  nativeCurrency: { name: 'Spark', symbol: 'SPARK', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.fusespark.io'] },
  },
  blockExplorers: {
    default: {
      name: 'Sparkent Explorer',
      url: 'https://explorer.fusespark.io',
      apiUrl: 'https://explorer.fusespark.io/api',
    },
  },
})
