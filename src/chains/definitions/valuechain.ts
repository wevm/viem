import { defineChain } from '../../utils/chain/defineChain.js'

/** ValueChain mainnet. */
export const valuechain = /*#__PURE__*/ defineChain({
  id: 286_623,
  name: 'ValueChain',
  blockTime: 2_000,
  nativeCurrency: { name: 'SOSO', symbol: 'SOSO', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet.valuechain.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'ValueChain Explorer',
      url: 'https://main-scan.valuechain.xyz',
    },
  },
})
