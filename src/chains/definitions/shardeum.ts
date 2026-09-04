import * as Chain from '../../core/Chain.js'

export const shardeum = /*#__PURE__*/ Chain.from({
  id: 8118,
  name: 'Shardeum',
  nativeCurrency: { name: 'Shardeum', symbol: 'SHM', decimals: 18 },
  rpcUrls: {
    http: 'https://api.shardeum.org',
  },
  blockExplorers: {
    name: 'Shardeum Explorer',
    url: 'https://explorer.shardeum.org',
  },
  testnet: false,
})
