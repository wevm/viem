import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const radius = /*#__PURE__*/ Chain.from({
  id: 723_487,
  name: 'Radius Network',
  nativeCurrency: { name: 'Radius USD', symbol: 'RUSD', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc.radiustech.xyz',
  },
  blockExplorers: {
    name: 'Radius Network Explorer',
    url: 'https://network.radiustech.xyz',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: false,
})
