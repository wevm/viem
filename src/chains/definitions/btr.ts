import { defineChain } from '../../utils/chain/defineChain.js'

export const btr = /*#__PURE__*/ defineChain({
  id: 200901,
  name: 'Bitlayer',
  nativeCurrency: {
    name: 'Bitcoin',
    symbol: 'BTC',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [
        'https://rpc.bitlayer.org',
        'https://rpc.bitlayer-rpc.com',
        'https://rpc.ankr.com/bitlayer',
      ],
      webSocket: ['wss://ws.bitlayer.org', 'wss://ws.bitlayer-rpc.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Bitlayer(BTR) Scan',
      url: 'https://www.btrscan.com',
    },
  },
})
