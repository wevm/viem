import { defineChain } from '../../utils/chain/defineChain.js'

export const birdlayer = defineChain({
  id: 53456,
  name: 'BirdLayer',
  nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
  rpcUrls: {
    default: {
      http: ['https://rpc.birdlayer.xyz', 'https://rpc1.birdlayer.xyz'],
      webSocket: ['wss://rpc.birdlayer.xyz/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BirdLayer Explorer',
      url: 'https://scan.birdlayer.xyz',
    },
  },
})
