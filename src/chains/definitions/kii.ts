import * as Chain from '../../core/Chain.js'

export const kii = /*#__PURE__*/ Chain.define({
  id: 1783n,
  name: 'KiiChain',
  network: 'kii-chain',
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
