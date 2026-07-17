import * as Chain from '../../core/Chain.js'

export const openledger = /*#__PURE__*/ Chain.from({
  id: 1612,
  name: 'OpenLedger',
  nativeCurrency: { name: 'Open', symbol: 'OPEN', decimals: 18 },
  rpcUrls: { http: 'https://rpc.openledger.xyz' },
  blockExplorers: {
    name: 'OpenLedger Explorer',
    url: 'https://scan.openledger.xyz',
  },
  testnet: false,
})
