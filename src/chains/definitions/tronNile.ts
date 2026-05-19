import * as Chain from '../../core/Chain.js'

export const tronNile = /*#__PURE__*/ Chain.define({
  id: 3448148188n,
  name: 'Tron Nile',
  nativeCurrency: { name: 'TRON', symbol: 'TRX', decimals: 6 },
  rpcUrls: {
    default: {
      http: ['https://nile.trongrid.io/jsonrpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Tronscan',
      url: 'https://nile.tronscan.org',
    },
  },
  testnet: true,
})
