import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const btr = /*#__PURE__*/ Chain.from({
  id: 200901,
  name: 'Bitlayer',
  nativeCurrency: {
    name: 'Bitcoin',
    symbol: 'BTC',
    decimals: 18,
  },
  rpcUrls: {
    http: ['https://rpc.bitlayer.org', 'https://rpc.bitlayer-rpc.com'],
    ws: ['wss://ws.bitlayer.org', 'wss://ws.bitlayer-rpc.com'],
  },
  blockExplorers: {
    name: 'Bitlayer(BTR) Scan',
    url: 'https://www.btrscan.com',
  },
  contracts: {
    create2: Contracts.create2,
  },
})
