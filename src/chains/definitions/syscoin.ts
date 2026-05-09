import { defineChain } from '../../utils/chain/defineChain.js'

export const syscoin = /*#__PURE__*/ defineChain({
  id: 57,
  name: 'Syscoin Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Syscoin',
    symbol: 'SYS',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.syscoin.org'],
      webSocket: ['wss://rpc.syscoin.org/wss'],
    },
  },
  blockExplorers: {
    default: {
      name: 'SyscoinExplorer',
      url: 'https://explorer.syscoin.org',
      apiUrl: 'https://explorer.syscoin.org/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 287139,
    },
  },
})
