import { defineChain } from '../../utils/chain/defineChain.js'

export const syscoinTestnet = /*#__PURE__*/ defineChain({
  id: 5700,
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
})
