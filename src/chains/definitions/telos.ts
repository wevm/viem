import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const telos = /*#__PURE__*/ Chain.from({
  id: 40,
  name: 'Telos',
  nativeCurrency: {
    decimals: 18,
    name: 'Telos',
    symbol: 'TLOS',
  },
  rpcUrls: { http: 'https://rpc.telos.net' },
  blockExplorers: {
    name: 'Teloscan',
    url: 'https://www.teloscan.io/',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 246530709,
    },
  },
})
