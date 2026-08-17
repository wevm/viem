import * as Chain from '../../core/Chain.js'

export const uniqueOpal = /*#__PURE__*/ Chain.from({
  id: 8882,
  name: 'Opal Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'OPL',
    symbol: 'OPL',
  },
  rpcUrls: { http: 'https://rpc-opal.unique.network' },
  blockExplorers: {
    name: 'Opal Subscan',
    url: 'https://opal.subscan.io/',
  },
  testnet: true,
})
