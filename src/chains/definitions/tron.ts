import { defineChain } from '../../utils/chain/defineChain.js'

export const tron = /*#__PURE__*/ defineChain({
  id: 728126428,
  name: 'Tron',
  nativeCurrency: { name: 'TRON', symbol: 'TRX', decimals: 6 },
  rpcUrls: {
    default: {
      http: ['https://api.trongrid.io/jsonrpc'],
    },
    ankr: {
      http: ['https://rpc.ankr.com/tron_jsonrpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Tronscan',
      url: 'https://tronscan.org',
      apiUrl: 'https://apilist.tronscanapi.com/api',
    },
  },
})
