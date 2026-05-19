import * as Chain from '../../core/Chain.js'

export const shardeum = /*#__PURE__*/ Chain.define({
  id: 8118n,
  name: 'Shardeum',
  nativeCurrency: { name: 'Shardeum', symbol: 'SHM', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://api.shardeum.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Shardeum Explorer',
      url: 'https://explorer.shardeum.org',
    },
  },
  testnet: false,
})
