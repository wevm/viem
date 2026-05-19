import * as Chain from '../../core/Chain.js'

export const orderlySepolia = /*#__PURE__*/ Chain.define({
  id: 4460n,
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
