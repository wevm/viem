import * as Chain from '../../core/Chain.js'

export const arthera = /*#__PURE__*/ Chain.define({
  id: 10242n,
  name: 'Arthera',
  nativeCurrency: { name: 'Arthera', symbol: 'AA', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.arthera.net'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Arthera EVM Explorer',
      url: 'https://explorer.arthera.net',
      apiUrl: 'https://explorer.arthera.net/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 4502791,
    },
  },
})
