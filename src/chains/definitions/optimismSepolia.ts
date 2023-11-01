import { defineChain } from '../../utils/chain/defineChain.js'
import { formattersOptimism } from '../optimism/formatters.js'

export const optimismSepolia = /*#__PURE__*/ defineChain(
  {
    id: 11155420,
    name: 'Optimism Sepolia',
    network: 'optimism-sepolia',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: {
        http: ['https://sepolia.optimism.io'],
      },
      public: {
        http: ['https://sepolia.optimism.io'],
      },
    },
    blockExplorers: {
      blockscout: {
        name: 'Blockscout',
        url: 'https://optimism-sepolia.blockscout.com',
      },
      default: {
        name: 'Blockscout',
        url: 'https://optimism-sepolia.blockscout.com',
      },
    },
    contracts: {
      multicall3: {
        address: '0xca11bde05977b3631167028862be2a173976ca11',
        blockCreated: 1620204,
      },
    },
    testnet: true,
  },
  {
    formatters: formattersOptimism,
  },
)
