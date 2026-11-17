import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const songbird = /*#__PURE__*/ Chain.from({
  id: 19,
  name: 'Songbird Canary-Network',
  nativeCurrency: {
    decimals: 18,
    name: 'Songbird',
    symbol: 'SGB',
  },
  rpcUrls: { http: 'https://songbird-api.flare.network/ext/C/rpc' },
  blockExplorers: {
    name: 'Songbird Explorer',
    url: 'https://songbird-explorer.flare.network',
    apiUrl: 'https://songbird-explorer.flare.network/api',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 13382504,
    },
  },
})
