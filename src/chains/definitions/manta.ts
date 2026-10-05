import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const manta = /*#__PURE__*/ Chain.from({
  id: 169,
  name: 'Manta Pacific Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: { http: 'https://pacific-rpc.manta.network/http' },
  blockExplorers: {
    name: 'Manta Explorer',
    url: 'https://pacific-explorer.manta.network',
    apiUrl: 'https://pacific-explorer.manta.network/api',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 332890,
    },
  },
})
