import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const sidraChain = /*#__PURE__*/ Chain.from({
  id: 97_453,
  name: 'Sidra Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'Sidra Digital Asset',
    symbol: 'SDA',
  },
  rpcUrls: {
    http: 'https://node.sidrachain.com',
  },
  blockExplorers: {
    name: 'Sidra Chain Explorer',
    url: 'https://ledger.sidrachain.com',
  },
  contracts: {
    create2: Contracts.create2,
  },
})
