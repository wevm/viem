import * as Chain from '../../core/Chain.js'

export const eCanna = /*#__PURE__*/ Chain.from({
  id: 4111,
  name: 'E Canna Mainnet',
  nativeCurrency: {
    name: 'E Canna',
    symbol: 'ECNA',
    decimals: 18,
  },
  rpcUrls: {
    http: ['https://rpc.ecnascan.com'],
  },
  blockExplorers: {
    name: 'ECNA Scan',
    url: 'https://explorer.ecnascan.com',
  },
})
