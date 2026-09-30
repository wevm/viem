import { defineChain } from '../../utils/chain/defineChain.js'

export const crymadL2 = /*#__PURE__*/ defineChain({
  id: 7373,
  name: 'CRYMAD Chain L2',
  nativeCurrency: {
    name: 'CryMadX',
    symbol: 'CMX-R',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpcl2.cmxofficial.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'CRYMAD Chain L2 Explorer',
      url: 'https://explorer-l2.cmxofficial.com',
      apiUrl: 'https://explorer-l2.cmxofficial.com/api/v2',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 0,
    },
  },
  sourceId: 1475,
})
