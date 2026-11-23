import { defineChain } from '../../utils/chain/defineChain.js'

export const tsxTestnet = /*#__PURE__*/ defineChain({
  id: 445,
  name: 'TSX Testnet',
  blockTime: 1_000,
  nativeCurrency: {
    decimals: 18,
    name: 'TSX',
    symbol: 'TSX',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.tsx.network/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'TSX Explorer',
      url: 'https://scan.tsx.network/testnet',
      apiUrl: 'https://scan.tsx.network/testnet/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 35_878,
    },
  },
  testnet: true,
})
