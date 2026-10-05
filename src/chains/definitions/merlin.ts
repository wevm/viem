import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const merlin = /*#__PURE__*/ Chain.from({
  id: 4200,
  name: 'Merlin',
  nativeCurrency: {
    name: 'BTC',
    symbol: 'BTC',
    decimals: 18,
  },
  rpcUrls: { http: 'https://rpc.merlinchain.io' },
  blockExplorers: {
    name: 'blockscout',
    url: 'https://scan.merlinchain.io',
    apiUrl: 'https://scan.merlinchain.io/api',
  },
  contracts: {
    create2: Contracts.create2,
  },
})
