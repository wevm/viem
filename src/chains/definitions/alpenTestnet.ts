import { defineChain } from '../../utils/chain/defineChain.js'

export const alpenTestnet = /*#__PURE__*/ defineChain({
  id: 8150,
  name: 'Alpen Testnet',
  nativeCurrency: { name: 'Signet BTC', symbol: 'sBTC', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.alpenlabs.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Alpen Explorer',
      url: 'https://explorer.testnet.alpenlabs.io',
      apiUrl: 'https://explorer.testnet.alpenlabs.io/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 290408,
    },
  },
  testnet: true,
})
