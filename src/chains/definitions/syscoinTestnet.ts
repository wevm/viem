import * as Chain from '../../core/Chain.js'

export const syscoinTestnet = /*#__PURE__*/ Chain.define({
  id: 5700n,
  name: 'Syscoin Tanenbaum Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Syscoin',
    symbol: 'SYS',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.tanenbaum.io'],
      webSocket: ['wss://rpc.tanenbaum.io/wss'],
    },
  },
  blockExplorers: {
    default: {
      name: 'SyscoinTestnetExplorer',
      url: 'https://tanenbaum.io',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 271288,
    },
  },
  testnet: true,
})
