import { defineChain } from '../../utils/chain/defineChain.js'

export const scroll = /*#__PURE__*/ defineChain({
  id: 534_352,
  name: 'Scroll',
  network: 'scroll',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.scroll.io'],
      webSocket: ['wss://wss-rpc.scroll.io/ws'],
    },
    public: {
      http: ['https://rpc.scroll.io'],
      webSocket: ['wss://wss-rpc.scroll.io/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Scrollscan',
      url: 'https://scrollscan.com',
    },
    blockscout: {
      name: 'Blockscout',
      url: 'https://blockscout.scroll.io',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 14,
    },
  },
  testnet: false,
})
