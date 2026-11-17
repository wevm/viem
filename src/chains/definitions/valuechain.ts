import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

/** ValueChain mainnet. */
export const valuechain = /*#__PURE__*/ Chain.from({
  id: 286_623,
  name: 'ValueChain',
  blockTime: 2_000,
  nativeCurrency: { name: 'SOSO', symbol: 'SOSO', decimals: 18 },
  rpcUrls: {
    http: 'https://mainnet.valuechain.xyz',
  },
  blockExplorers: {
    name: 'ValueChain Explorer',
    url: 'https://main-scan.valuechain.xyz',
  },
  contracts: {
    create2: Contracts.create2,
  },
})
