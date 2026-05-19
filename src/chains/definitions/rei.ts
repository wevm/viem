import * as Chain from '../../core/Chain.js'

export const rei = /*#__PURE__*/ Chain.define({
  id: 47805n,
  name: 'REI Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'REI',
    symbol: 'REI',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.rei.network'],
      webSocket: ['wss://rpc.rei.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'REI Scan',
      url: 'https://scan.rei.network',
    },
  },
  testnet: false,
})
