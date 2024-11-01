import { defineChain } from '../../utils/chain/defineChain.js'

export const sanko = /*#__PURE__*/ defineChain({
  id: 1996,
  name: 'Sanko',
  nativeCurrency: { name: 'DMT', symbol: 'DMT', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet.sanko.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Sanko Explorer',
      url: 'https://explorer.sanko.xyz',
    },
  },
  testnet: false,
})
