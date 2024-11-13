import { defineChain } from '../../utils/chain/defineChain.js'

export const heco = /*#__PURE__*/ defineChain({
  id: 128,
  name: 'Huobi ECO Chain Mainnet',
  nativeCurrency: { name: 'HT', symbol: 'HT', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://http-mainnet.hecochain.com'],
      webSocket: ['wss://ws-mainnet.hecochain.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Heco Scan',
      url: 'https://hecoscan.com',
    },
  },
  testnet: false,
})
