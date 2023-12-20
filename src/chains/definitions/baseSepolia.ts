import { defineChain } from '../../utils/chain/defineChain.js'
import { formattersOptimism } from '../optimism/formatters.js'

export const baseSepolia = /*#__PURE__*/ defineChain(
  {
    id: 84532,
    network: 'base-sepolia',
    name: 'Base Sepolia',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      alchemy: {
        http: ['https://base-sepolia.g.alchemy.com/v2'],
        webSocket: ['wss://base-sepolia.g.alchemy.com/v2'],
      },
      default: {
        http: ['https://sepolia.base.org'],
      },
      public: {
        http: ['https://sepolia.base.org'],
      },
    },
    blockExplorers: {
      blockscout: {
        name: 'Blockscout',
        url: 'https://base-sepolia.blockscout.com',
      },
      default: {
        name: 'Blockscout',
        url: 'https://base-sepolia.blockscout.com',
      },
    },
    testnet: true,
    sourceId: 11155111, // sepolia
  },
  {
    formatters: formattersOptimism,
  },
)
