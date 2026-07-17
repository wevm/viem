import * as Chain from '../../core/Chain.js'

export const scroll = /*#__PURE__*/ Chain.from({
  id: 534_352,
  name: 'Scroll',
  blockTime: 3000,
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc.scroll.io',
    ws: 'wss://wss-rpc.scroll.io/ws',
  },
  blockExplorers: {
    name: 'Scrollscan',
    url: 'https://scrollscan.com',
    apiUrl: 'https://api.scrollscan.com/api',
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 14,
    },
  },
  testnet: false,
})
