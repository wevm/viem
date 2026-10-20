import { defineChain } from '../../utils/chain/defineChain.js'

export const bot = /*#__PURE__*/ defineChain({
  id: 677,
  name: 'BOT',
  nativeCurrency: { name: 'BOT', symbol: 'BOT', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.botchain.ai'],
      webSocket: ['wss://ws-rpc.botchain.ai'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BotScan Explorer',
      url: 'https://www.botscans.net/',
    },
  },
  testnet: false,
})
