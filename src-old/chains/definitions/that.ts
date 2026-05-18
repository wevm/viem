import { defineChain } from '../../utils/chain/defineChain.js'

export const that = /*#__PURE__*/ defineChain({
  id: 8428,
  name: 'THAT Mainnet',
  nativeCurrency: { name: 'THAT', symbol: 'THAT', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://api.thatchain.io/mainnet'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://that.blockscout.com',
    },
  },
  testnet: false,
})
