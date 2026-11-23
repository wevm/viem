import { defineChain } from '../../utils/chain/defineChain.js'

export const tsxHorizon = /*#__PURE__*/ defineChain({
  id: 455,
  name: 'TSX Horizon',
  blockTime: 1_000,
  nativeCurrency: {
    decimals: 18,
    name: 'TSX',
    symbol: 'TSX',
  },
  rpcUrls: {
    default: {
      http: ['https://horizon.tsx.network/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'TSX Explorer',
      url: 'https://scan.tsx.network/horizon',
      apiUrl: 'https://scan.tsx.network/horizon/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 26,
    },
  },
})
