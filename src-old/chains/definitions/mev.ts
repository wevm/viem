import { defineChain } from '../../utils/chain/defineChain.js'

export const mev = /*#__PURE__*/ defineChain({
  id: 7518,
  name: 'MEVerse Chain Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MEVerse',
    symbol: 'MEV',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.meversemainnet.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Explorer',
      url: 'https://www.meversescan.io',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 86881340,
    },
  },
})
