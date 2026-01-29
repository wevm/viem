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
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 1792,
    },
    ensRegistry: {
      address: '0x5dC881dDA4e4a8d312be3544AD13118D1a04Cb17',
      blockCreated: 1322033,
    },
    ensUniversalResolver: {
      address: '0x6D3B3F99177FB2A5de7F9E928a9BD807bF7b5BAD',
      blockCreated: 1322097,
    },
  },
  rpcUrls: {
    default: { http: ['https://aeneid.storyrpc.io'] },
  },
  blockExplorers: {
    default: {
      name: 'Story Aeneid Explorer',
      url: 'https://aeneid.storyscan.xyz',
      apiUrl: 'https://aeneid.storyscan.xyz/api/v2',
    },
  },
  ensTlds: ['.ip'],
  testnet: true,
})
