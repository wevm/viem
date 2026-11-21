import { defineChain } from '../../utils/chain/defineChain.js'

export const orderlySepolia = /*#__PURE__*/ defineChain({
  id: 4460,
  name: 'Orderly Sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.orderly.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Orderly Explorer',
      url: 'https://testnet-explorer.orderly.org',
    },
  },
  testnet: true,
})
