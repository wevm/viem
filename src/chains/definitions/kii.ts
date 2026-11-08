import * as Chain from '../../core/Chain.js'

export const kii = /*#__PURE__*/ Chain.from({
  id: 1783,
  name: 'KiiChain',
  nativeCurrency: {
    name: 'Kii',
    symbol: 'KII',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://json-rpc.kiivalidator.com',
  },
  blockExplorers: {
    name: 'KiiExplorer',
    url: 'https://explorer.kiichain.io',
  },
})
