import * as Chain from '../../core/Chain.js'

export const tronNile = /*#__PURE__*/ Chain.from({
  id: 3448148188,
  name: 'Tron Nile',
  nativeCurrency: { name: 'TRON', symbol: 'TRX', decimals: 6 },
  rpcUrls: {
    http: 'https://nile.trongrid.io/jsonrpc',
  },
  blockExplorers: {
    name: 'Tronscan',
    url: 'https://nile.tronscan.org',
  },
  testnet: true,
})
