import * as Chain from '../../core/Chain.js'

export const sidraChain = /*#__PURE__*/ Chain.define({
  id: 97_453n,
  name: 'Sidra Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'Sidra Digital Asset',
    symbol: 'SDA',
  },
  rpcUrls: {
    default: {
      http: ['https://node.sidrachain.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Sidra Chain Explorer',
      url: 'https://ledger.sidrachain.com',
    },
  },
})
