import { defineChain } from '../../utils/chain/defineChain.js'

export const rollux = /*#__PURE__*/ defineChain({
  id: 570,
  name: 'Rollux Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Syscoin',
    symbol: 'SYS',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.rollux.com'],
      webSocket: ['wss://rpc.rollux.com/wss'],
    },
  },
  blockExplorers: {
    default: {
      name: 'RolluxExplorer',
      url: 'https://explorer.rollux.com',
      apiUrl: 'https://explorer.rollux.com/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 119222,
    },
  },
})
