import { defineChain } from '../utils.js'

export const dynasty = /*#__PURE__*/ defineChain({
  id: 701322,
  name: 'Dynasty',
  nativeCurrency: {
    name: 'DNY',
    symbol: 'DNY',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet-rpc.dnyscan.io/'],
      webSocket: ['wss://mainnet-rpc.dnyscan.io/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'DynastyScan',
      url: 'https://dnyscan.io/',
    },
  },
  testnet: false,
})
