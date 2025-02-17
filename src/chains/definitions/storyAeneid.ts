import { defineChain } from '../../utils/chain/defineChain.js'

export const storyAeneid = /*#__PURE__*/ defineChain({
  id: 1315,
  name: 'Story Aeneid',
  network: 'story-aeneid',
  nativeCurrency: {
    decimals: 18,
    name: 'IP',
    symbol: 'IP',
  },
  rpcUrls: {
    default: { http: ['https://aeneid.storyrpc.io'] },
  },
  blockExplorers: {
    default: {
      name: 'Story Aeneid Explorer',
      url: 'https://aeneid.storyscan.xyz',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 1792,
    },
  },
  testnet: true,
})
