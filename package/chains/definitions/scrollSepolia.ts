import { defineChain } from '../../utils/chain.js'

export const scrollSepolia = /*#__PURE__*/ defineChain({
  id: 534_351,
  name: 'Scroll Sepolia',
  network: 'scroll-sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://sepolia-rpc.scroll.io'],
      webSocket: ['wss://sepolia-rpc.scroll.io/ws'],
    },
    public: {
      http: ['https://sepolia-rpc.scroll.io'],
      webSocket: ['wss://sepolia-rpc.scroll.io/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://sepolia-blockscout.scroll.io',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 9473,
    },
  },
  testnet: true,
})
