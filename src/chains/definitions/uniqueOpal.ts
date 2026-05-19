import * as Chain from '../../core/Chain.js'

export const uniqueOpal = /*#__PURE__*/ Chain.define({
  id: 8882n,
  name: 'Opal Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'OPL',
    symbol: 'OPL',
  },
  rpcUrls: {
    default: { http: ['https://rpc-opal.unique.network'] },
  },
  blockExplorers: {
    default: {
      name: 'Opal Subscan',
      url: 'https://opal.subscan.io/',
    },
  },
  testnet: true,
})
