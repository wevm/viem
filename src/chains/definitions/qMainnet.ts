import * as Chain from '../../core/Chain.js'

export const qMainnet = /*#__PURE__*/ Chain.from({
  id: 35441,
  name: 'Q Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Q',
    symbol: 'Q',
  },
  rpcUrls: { http: 'https://rpc.q.org' },
  blockExplorers: {
    name: 'Q Mainnet Explorer',
    url: 'https://explorer.q.org',
    apiUrl: 'https://explorer.q.org/api',
  },
})
