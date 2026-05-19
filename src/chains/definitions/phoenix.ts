// src/chains/definitions/phoenix.ts
import * as Chain from '../../core/Chain.js'

export const phoenix = /*#__PURE__*/ Chain.define({
  id: 13381n,
  name: 'Phoenix Blockchain',
  nativeCurrency: { name: 'Phoenix', symbol: 'PHX', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.phoenixplorer.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Phoenixplorer',
      url: 'https://phoenixplorer.com',
      apiUrl: 'https://phoenixplorer.com/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0x498cF757a575cFF2c2Ed9f532f56Efa797f86442',
      blockCreated: 5620192,
    },
  },
})
