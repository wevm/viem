import { defineChain } from '../../utils/chain/defineChain.js'

export const redstone = defineChain({
  id: 690,
  name: 'Redstone',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.redstonechain.com'],
      webSocket: ['wss://rpc.redstonechain.com'],
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: '	https://explorer.redstone.xyz' },
  },
})
