import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const moonbaseAlpha = /*#__PURE__*/ Chain.from({
  id: 1287,
  name: 'Moonbase Alpha',
  nativeCurrency: {
    decimals: 18,
    name: 'DEV',
    symbol: 'DEV',
  },
  rpcUrls: {
    http: 'https://rpc.api.moonbase.moonbeam.network',
    ws: 'wss://wss.api.moonbase.moonbeam.network',
  },
  blockExplorers: {
    name: 'Moonscan',
    url: 'https://moonbase.moonscan.io',
    apiUrl: 'https://moonbase.moonscan.io/api',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 1850686,
    },
  },
  testnet: true,
})
