import * as Chain from '../../core/Chain.js'

export const btrTestnet = /*#__PURE__*/ Chain.from({
  id: 200810,
  name: 'Bitlayer Testnet',
  nativeCurrency: {
    name: 'Bitcoin',
    symbol: 'BTC',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://testnet-rpc.bitlayer.org',
    ws: ['wss://testnet-ws.bitlayer.org', 'wss://testnet-ws.bitlayer-rpc.com'],
  },
  blockExplorers: {
    name: 'Bitlayer(BTR) Scan',
    url: 'https://testnet.btrscan.com',
  },
  testnet: true,
})
