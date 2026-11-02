import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const orderlySepolia = /*#__PURE__*/ Chain.from({
  id: 4460,
  name: 'Orderly Sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    http: 'https://l2-orderly-l2-4460-sepolia-8tc3sd7dvy.t.conduit.xyz',
  },
  blockExplorers: {
    name: 'Orderly Explorer',
    url: 'https://explorerl2new-orderly-l2-4460-sepolia-8tc3sd7dvy.t.conduit.xyz',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: true,
})
