import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const fuseSparknet = /*#__PURE__*/ Chain.from({
  id: 123,
  name: 'Fuse Sparknet',
  nativeCurrency: { name: 'Spark', symbol: 'SPARK', decimals: 18 },
  rpcUrls: { http: 'https://rpc.fusespark.io' },
  blockExplorers: {
    name: 'Sparkent Explorer',
    url: 'https://explorer.fusespark.io',
    apiUrl: 'https://explorer.fusespark.io/api',
  },
  contracts: {
    create2: Contracts.create2,
  },
})
