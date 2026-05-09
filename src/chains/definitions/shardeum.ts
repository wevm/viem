import { defineChain } from '../../utils/chain/defineChain.js'

export const shardeum = /*#__PURE__*/ defineChain({
  id: 8118,
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
