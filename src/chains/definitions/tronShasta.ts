import * as Chain from '../../core/Chain.js'

export const tronShasta = /*#__PURE__*/ Chain.from({
  id: 2494104990,
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
