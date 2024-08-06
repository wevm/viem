import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 168_587_773 // base-sepolia

export const b3Sepolia = /*#__PURE__*/ defineChain({
  id: 1993,
  name: 'B3 Sepolia',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia.b3.fun'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://sepolia.explorer.b3.fun',
    },
  },
  testnet: true,
  sourceId,
})
