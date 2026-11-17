import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const syscoin = /*#__PURE__*/ Chain.from({
  id: 57,
  name: 'Syscoin Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Syscoin',
    symbol: 'SYS',
  },
  rpcUrls: {
    http: 'https://rpc.syscoin.org',
    ws: 'wss://rpc.syscoin.org/wss',
  },
  blockExplorers: {
    name: 'SyscoinExplorer',
    url: 'https://explorer.syscoin.org',
    apiUrl: 'https://explorer.syscoin.org/api',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 287139,
    },
  },
})
