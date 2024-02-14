import { defineChain } from '../../utils/chain/defineChain.js'

export const kakarotSepolia = /*#__PURE__*/ defineChain({
  id: 107107114116,
  name: 'Kakarot Sepolia',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia-rpc.kakarot.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Kakarot Scan',
      url: 'https://sepolia.kakarotscan.org',
    },
  },
  testnet: true,
})
