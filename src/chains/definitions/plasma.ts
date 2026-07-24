import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const plasma = /*#__PURE__*/ Chain.from({
  id: 9745,
  name: 'Plasma',
  blockTime: 1000,
  nativeCurrency: {
    name: 'Plasma',
    symbol: 'XPL',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://rpc.plasma.to',
  },
  blockExplorers: {
    name: 'PlasmaScan',
    url: 'https://plasmascan.to',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 0,
    },
  },
})
