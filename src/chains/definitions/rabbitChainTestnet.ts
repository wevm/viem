import * as Chain from '../../core/Chain.js'

export const rabbitChainTestnet = /*#__PURE__*/ Chain.from({
  id: 9280,
  name: 'Rabbit Chain Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Test Rabbit',
    symbol: 'tRAB',
  },
  rpcUrls: {
    http: ['https://rpc-testnet.rabbitchain.org'],
  },
  blockExplorers: {
    name: 'Rabbit Chain Testnet Explorer',
    url: 'https://explorer-testnet.rabbitchain.org',
  },
  testnet: true,
})
