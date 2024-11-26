import { defineChain } from '../../utils/chain/defineChain.js'

export const darwinia = /*#__PURE__*/ defineChain({
  id: 46,
  name: 'Darwinia Network',
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
    default: { name: 'Explorer', url: 'https://explorer.darwinia.network' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 69420,
    },
  },
})
