import * as Chain from '../../core/Chain.js'

export const fuseSparknet = /*#__PURE__*/ Chain.define({
  id: 123n,
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
