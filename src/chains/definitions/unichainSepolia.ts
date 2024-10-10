import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 11_155_111 // sepolia

export const unichainSepolia = /*#__PURE__*/ defineChain({
  id: 1301,
  name: 'Unichain Sepolia',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia.unichain.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Uniscan',
      url: 'https://sepolia.uniscan.xyz',
      apiUrl: 'https://api-sepolia.uniscan.xyz',
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
