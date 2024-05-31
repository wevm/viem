import { defineChain } from '../../utils/chain/defineChain.js'

export const defioraclemetaMainnet = /*#__PURE__*/ defineChain({
  id: 138,
  name: 'Defi Oracle Meta Mainnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.defi-oracle.io"],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout Explorer',
      url: 'https://blockscout.defi-oracle.io',
    },
  },
})