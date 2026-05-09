import { defineChain } from '../../utils/chain/defineChain.js'

export const tronNile = /*#__PURE__*/ defineChain({
  id: 3448148188,
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
