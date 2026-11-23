import { defineChain } from '../../utils/chain/defineChain.js'

export const tsxBastion = /*#__PURE__*/ defineChain({
  id: 454,
  name: 'TSX Bastion',
  blockTime: 1_000,
  nativeCurrency: {
    decimals: 18,
    name: 'TSX',
    symbol: 'TSX',
  },
  rpcUrls: {
    default: {
      http: ['https://bastion.tsx.network/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'TSX Explorer',
      url: 'https://scan.tsx.network/bastion',
      apiUrl: 'https://scan.tsx.network/bastion/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 23,
    },
  },
})
