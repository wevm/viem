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
      http: ['https://sepolia.b3.fun/http'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://sepolia.explorer.b3.fun',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 0,
    },
  },
  testnet: true,
  sourceId,
})
