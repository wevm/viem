import * as Chain from '../../core/Chain.js'

export const btrTestnet = /*#__PURE__*/ Chain.define({
  id: 200810n,
  name: 'Bitlayer Testnet',
  nativeCurrency: {
    name: 'Bitcoin',
    symbol: 'BTC',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.bitlayer.org'],
      webSocket: [
        'wss://testnet-ws.bitlayer.org',
        'wss://testnet-ws.bitlayer-rpc.com',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Bitlayer(BTR) Scan',
      url: 'https://testnet.btrscan.com',
    },
  },
  testnet: true,
})
