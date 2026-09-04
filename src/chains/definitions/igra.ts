import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const igra = /*#__PURE__*/ Chain.from({
  id: 38833,
  name: 'Igra Network',
  nativeCurrency: {
    decimals: 18,
    name: 'iKAS',
    symbol: 'iKAS',
  },
  rpcUrls: {
    http: 'https://rpc.igralabs.com:8545',
  },
  blockExplorers: {
    name: 'Igra Explorer',
    url: 'https://explorer.igralabs.com',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: false,
})
