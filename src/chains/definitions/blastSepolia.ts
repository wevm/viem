import { defineChain } from '../../utils/chain/defineChain.js'

export const blastSepolia = /*#__PURE__*/ defineChain({
  id: 168_587_773,
  name: 'Blast Sepolia',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia.blast.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blastscan',
      url: 'https://testnet.blastscan.io',
    },
  },
  testnet: true,
})
