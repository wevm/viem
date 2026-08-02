import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const syscoinTestnet = /*#__PURE__*/ Chain.from({
  id: 5700,
  name: 'Syscoin Tanenbaum Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Syscoin',
    symbol: 'SYS',
  },
  rpcUrls: {
    http: 'https://rpc.tanenbaum.io',
    ws: 'wss://rpc.tanenbaum.io/wss',
  },
  blockExplorers: {
    name: 'SyscoinTestnetExplorer',
    url: 'https://tanenbaum.io',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 271288,
    },
  },
  testnet: true,
})
