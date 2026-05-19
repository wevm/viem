import * as Chain from '../../core/Chain.js'

export const tronShasta = /*#__PURE__*/ Chain.define({
  id: 2494104990n,
  name: 'Tron Shasta',
  nativeCurrency: { name: 'TRON', symbol: 'TRX', decimals: 6 },
  rpcUrls: {
    default: {
      http: ['https://api.shasta.trongrid.io/jsonrpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Tronscan',
      url: 'https://shasta.tronscan.org',
    },
  },
  testnet: true,
})
