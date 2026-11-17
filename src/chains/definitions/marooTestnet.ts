import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const marooTestnet = /*#__PURE__*/ Chain.from({
  id: 450_815,
  name: 'Maroo Testnet',
  nativeCurrency: { name: 'Testnet OKRW', symbol: 'tOKRW', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc-testnet.maroo.io',
    ws: 'wss://ws-testnet.maroo.io',
  },
  blockExplorers: {
    name: 'Blockscout',
    url: 'https://explorer-testnet.maroo.io',
    apiUrl: 'https://explorer-testnet.maroo.io/blockscout/api',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 0,
    },
  },
  testnet: true,
})
