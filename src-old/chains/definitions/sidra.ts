import { defineChain } from '../../utils/chain/defineChain.js'

export const sidraChain = /*#__PURE__*/ defineChain({
  id: 97_453,
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
