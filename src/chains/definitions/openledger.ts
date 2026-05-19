import * as Chain from '../../core/Chain.js'

export const openledger = /*#__PURE__*/ Chain.define({
  id: 1612n,
  name: 'OpenLedger',
  nativeCurrency: { name: 'Open', symbol: 'OPEN', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.openledger.xyz'] },
  },
  blockExplorers: {
    default: {
      name: 'OpenLedger Explorer',
      url: 'https://scan.openledger.xyz',
    },
  },
  testnet: false,
})
