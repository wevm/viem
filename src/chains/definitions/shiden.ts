import * as Chain from '../../core/Chain.js'

export const shiden = /*#__PURE__*/ Chain.from({
  id: 336,
  name: 'Shiden',
  nativeCurrency: {
    decimals: 18,
    name: 'SDN',
    symbol: 'SDN',
  },
  rpcUrls: {
    default: {
      http: ['https://shiden.public.blastapi.io'],
      webSocket: ['wss://shiden-rpc.dwellir.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Shiden Scan',
      url: 'https://shiden.subscan.io',
    },
  },
  testnet: false,
})
