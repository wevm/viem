import * as Chain from '../../core/Chain.js'

export const unique = /*#__PURE__*/ Chain.from({
  id: 8880,
  name: 'Unique Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'UNQ',
    symbol: 'UNQ',
  },
  rpcUrls: { http: 'https://rpc.unique.network' },
  blockExplorers: {
    name: 'Unique Subscan',
    url: 'https://unique.subscan.io/',
  },
})
