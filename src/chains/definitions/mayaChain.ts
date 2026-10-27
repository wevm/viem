import { defineChain } from '../../utils/chain/defineChain.js'

export const mayaChain = /*#__PURE__*/ defineChain({
  id: 6292,
  name: 'MAYA CHAIN',
  nativeCurrency: { name: 'Maya 3G', symbol: 'M3G', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.mayachain.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'MayaScan',
      url: 'https://scan.mayachain.io',
    },
  },
})
