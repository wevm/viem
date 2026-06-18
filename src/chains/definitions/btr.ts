import * as Chain from '../../core/Chain.js'

export const btr = /*#__PURE__*/ Chain.from({
  id: 200901,
  name: 'Bitlayer',
  nativeCurrency: {
    name: 'Bitcoin',
    symbol: 'BTC',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.bitlayer.org', 'https://rpc.bitlayer-rpc.com'],
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
