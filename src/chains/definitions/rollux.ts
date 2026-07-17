import * as Chain from '../../core/Chain.js'

export const rollux = /*#__PURE__*/ Chain.from({
  id: 570,
  name: 'Rollux Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Syscoin',
    symbol: 'SYS',
  },
  rpcUrls: {
    http: 'https://rpc.rollux.com',
    ws: 'wss://rpc.rollux.com/wss',
  },
  blockExplorers: {
    name: 'RolluxExplorer',
    url: 'https://explorer.rollux.com',
    apiUrl: 'https://explorer.rollux.com/api',
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 119222,
    },
  },
})
