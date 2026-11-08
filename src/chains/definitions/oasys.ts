import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const oasys = /*#__PURE__*/ Chain.from({
  id: 248,
  name: 'Oasys',
  nativeCurrency: { name: 'Oasys', symbol: 'OAS', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc.mainnet.oasys.games',
  },
  blockExplorers: {
    name: 'OasysScan',
    url: 'https://scan.oasys.games',
    apiUrl: 'https://scan.oasys.games/api',
  },
  contracts: {
    create2: Contracts.create2,
  },
})
