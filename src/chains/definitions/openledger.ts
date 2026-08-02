import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const openledger = /*#__PURE__*/ Chain.from({
  id: 1612,
  name: 'OpenLedger',
  nativeCurrency: { name: 'Open', symbol: 'OPEN', decimals: 18 },
  rpcUrls: { http: 'https://rpc.openledger.xyz' },
  blockExplorers: {
    name: 'OpenLedger Explorer',
    url: 'https://scan.openledger.xyz',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: false,
})
