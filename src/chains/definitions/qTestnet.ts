import * as Chain from '../../core/Chain.js'

export const qTestnet = /*#__PURE__*/ Chain.define({
  id: 35443n,
  name: 'Q Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Q',
    symbol: 'Q',
  },
  rpcUrls: {
    default: { http: ['https://rpc.qtestnet.org'] },
  },
  blockExplorers: {
    default: {
      name: 'Q Testnet Explorer',
      url: 'https://explorer.qtestnet.org',
      apiUrl: 'https://explorer.qtestnet.org/api',
    },
  },
  testnet: true,
})
