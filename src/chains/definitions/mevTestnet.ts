import { defineChain } from '../../utils/chain/defineChain.js'

export const mevTestnet = /*#__PURE__*/ defineChain({
  id: 4759,
  name: 'MEVerse Chain Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MEVerse',
    symbol: 'MEV',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.meversetestnet.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Explorer',
      url: 'https://testnet.meversescan.io/',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 64371115,
    },
  },
  testnet: true,
})
