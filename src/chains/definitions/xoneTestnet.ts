import { defineChain } from '../../utils/chain/defineChain.js'

export const xoneTestnet = /*#__PURE__*/ defineChain({
  id: 33772211,
  name: 'Xone Chain Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'XOC',
    symbol: 'XOC',
  },
  rpcUrls: {
    default: { http: ['https://rpc-testnet.xone.org', 'https://rpc-testnet.xone.plus', 'https://rpc-testnet.knight.center'] },
  },
  blockExplorers: {
    default: {
      name: 'Xone Testnet Explorer',
      url: 'https://testnet.xonescan.com',
      apiUrl: 'http://api.testnet.xonescan.com/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 22938743,
    },
  },
  testnet: true,
})
