import * as Chain from '../../core/Chain.js'

export const darwinia = /*#__PURE__*/ Chain.from({
  id: 46,
  name: 'Darwinia Network',
  nativeCurrency: {
    decimals: 18,
    name: 'RING',
    symbol: 'RING',
  },
  rpcUrls: {
    http: 'https://rpc.darwinia.network',
    ws: 'wss://rpc.darwinia.network',
  },
  blockExplorers: {
    name: 'Explorer',
    url: 'https://explorer.darwinia.network',
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 69420,
    },
  },
})
