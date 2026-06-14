import { defineChain } from '../../utils/chain/defineChain.js'

export const unitsky = /*#__PURE__*/ defineChain({
  id: 778889,
  name: 'Unitsky String Technologies',
  nativeCurrency: { name: 'Unitsky Token', symbol: 'UST', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://147-45-143-23.sslip.io/rpc'],
      webSocket: ['wss://147-45-143-23.sslip.io/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Unitsky Explorer',
      url: 'https://147-45-143-23.sslip.io',
    },
  },
})
