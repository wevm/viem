import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const mantle = /*#__PURE__*/ Chain.from({
  id: 5000,
  name: 'Mantle',
  nativeCurrency: {
    decimals: 18,
    name: 'MNT',
    symbol: 'MNT',
  },
  rpcUrls: { http: 'https://rpc.mantle.xyz' },
  blockExplorers: {
    name: 'Mantle Explorer',
    url: 'https://mantlescan.xyz/',
    apiUrl: 'https://api.mantlescan.xyz/api',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 304717,
    },
  },
})
