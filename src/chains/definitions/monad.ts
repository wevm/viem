import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const monad = /*#__PURE__*/ Chain.from({
  id: 143,
  name: 'Monad',
  blockTime: 400,
  nativeCurrency: {
    name: 'Monad',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: {
    http: ['https://rpc.monad.xyz', 'https://rpc1.monad.xyz'],
    ws: ['wss://rpc.monad.xyz', 'wss://rpc1.monad.xyz'],
  },
  blockExplorers: {
    name: 'Monadscan',
    url: 'https://monadscan.com',
    apiUrl: 'https://api.etherscan.io/v2/api?chainid=143',
  },
  testnet: false,
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 9248132,
    },
  },
})
