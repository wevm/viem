import { defineChain } from '../../utils/chain/defineChain.js'

export const orderly = /*#__PURE__*/ defineChain({
  id: 4460,
  name: 'Orderly',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.orderly.network'] },
  },
  blockExplorers: {
    default: {
      name: 'Orderly Explorer',
      url: 'https://explorer.orderly.network',
    },
  },
  testnet: false,
})
