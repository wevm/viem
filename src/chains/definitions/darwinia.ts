import { defineChain } from '../../utils/chain/defineChain.js'
 
export const darwinia = defineChain({
  id: 46,
  name: 'Darwinia',
  nativeCurrency: {
    decimals: 18,
    name: 'RING',
    symbol: 'RING',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.darwinia.network'],
      webSocket: ['wss://rpc.darwinia.network'],
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://darwinia.subscan.io' },
  },
  
})