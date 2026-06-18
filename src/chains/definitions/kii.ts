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
    default: {
      http: ['https://json-rpc.kiivalidator.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'KiiExplorer',
      url: 'https://explorer.kiichain.io',
    },
  },
})
