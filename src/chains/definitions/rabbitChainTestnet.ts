import { defineChain } from '../../utils/chain/defineChain.js'

export const rabbitChainTestnet = /*#__PURE__*/ defineChain({
  id: 9280,
  name: 'Rabbit Chain Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Test Rabbit',
    symbol: 'tRAB',
  },
  rpcUrls: {
    default: { http: ['https://rpc-testnet.rabbitchain.org'] },
  },
  blockExplorers: {
    default: {
      name: 'Rabbit Chain Testnet Explorer',
      url: 'https://explorer-testnet.rabbitchain.org',
    },
  },
  testnet: true,
})
