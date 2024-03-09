import { defineChain } from '../../utils/chain/defineChain.js'

export const nutriemp = /*#__PURE__*/ defineChain({
  id: 420000,
  name: 'NutriEmp - Chain',
  nativeCurrency: { name: 'GRAMZ', symbol: 'GRAMZ', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://node2.nutriempchain.link'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Nutriemp - Explorer',
      url: 'https://explorer.nutriempchain.link',

    },
  },

})
