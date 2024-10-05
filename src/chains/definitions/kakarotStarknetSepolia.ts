import { defineChain } from '../../utils/chain/defineChain.js'

export const kakarotStarknetSepolia = /*#__PURE__*/ defineChain({
  id: 5424235787602241,
  name: 'Kakarot Starknet Sepolia',
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
