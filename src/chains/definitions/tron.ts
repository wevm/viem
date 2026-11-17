import * as Chain from '../../core/Chain.js'

export const tron = /*#__PURE__*/ Chain.from({
  id: 728126428,
  name: 'Tron',
  nativeCurrency: { name: 'TRON', symbol: 'TRX', decimals: 6 },
  rpcUrls: {
    http: 'https://api.trongrid.io/jsonrpc',
  },
  blockTime: 3000,
  blockExplorers: {
    name: 'Tronscan',
    url: 'https://tronscan.org',
    apiUrl: 'https://apilist.tronscanapi.com/api',
  },
})
