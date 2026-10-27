import { defineChain } from '../../utils/chain/defineChain.js'

export const molibra = /*#__PURE__*/ defineChain({
  id: 20226,
  name: 'Molibra',
  nativeCurrency: { name: 'Molibra', symbol: 'MOLI', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://molibra.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Moliscan',
      url: 'https://molibra.org/molibra/moliscan',
    },
  },
})
