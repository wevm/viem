import * as Chain from '../../core/Chain.js'

export const vechain = /*#__PURE__*/ Chain.from({
  id: 100009,
  name: 'Vechain',
  nativeCurrency: { name: 'VeChain', symbol: 'VET', decimals: 18 },
  rpcUrls: {
    http: 'https://mainnet.vechain.org',
  },
  blockExplorers: {
    name: 'Vechain Explorer',
    url: 'https://explore.vechain.org',
  },
})
