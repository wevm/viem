import { defineChain } from '../../utils/chain/defineChain.js'

export const happychainTestnet = /*#__PURE__*/ defineChain({
  id: 216,
  name: 'Happychain Testnet',
  nativeCurrency: {
    symbol: 'HAPPY',
    name: 'HAPPY',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.happy.tech/http'],
      webSocket: ['wss://rpc.testnet.happy.tech/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Happy Chain Testnet Explorer',
      url: 'https://explorer.testnet.happy.tech',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 1,
    },
  },
  testnet: true,
})
