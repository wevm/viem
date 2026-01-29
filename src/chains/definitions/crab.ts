import { defineChain } from '../../utils/chain/defineChain.js'

export const crab = defineChain({
  id: 44,
  name: 'Crab Network',
  nativeCurrency: {
    decimals: 18,
    name: 'Crab Network Native Token',
    symbol: 'CRAB',
  },
  rpcUrls: {
    default: {
      http: ['https://crab-rpc.darwinia.network'],
      webSocket: ['wss://crab-rpc.darwinia.network'],
    },
  },
  blockExplorers: {
    default: { name: 'Blockscout', url: 'https://crab-scan.darwinia.network' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 3032593,
    },
  },
})
