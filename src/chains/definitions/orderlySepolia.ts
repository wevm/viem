import { defineChain } from '../../utils/chain/defineChain.js'

export const orderlySepolia = /*#__PURE__*/ defineChain({
  id: 4460,
  name: 'Orderly Sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://l2-orderly-l2-4460-sepolia-8tc3sd7dvy.t.conduit.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Orderly Explorer',
      url: 'https://explorerl2new-orderly-l2-4460-sepolia-8tc3sd7dvy.t.conduit.xyz',
    },
  },
  testnet: true,
})
