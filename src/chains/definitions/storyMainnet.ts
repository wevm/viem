import { defineChain } from '../../utils/chain/defineChain.js'

export const storyMainnet = /*#__PURE__*/ defineChain({
  id: 1514,
  name: 'mainnet',
  network: 'story-mainnet',
  nativeCurrency: { 
    name: 'IP', 
    symbol: 'IP', 
    decimals: 18 
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.storyrpc.io/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Explorer',
      url: 'https://storyscan.xyz/',
    },
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 5882,
    },
  },
  testnet: false,
});
