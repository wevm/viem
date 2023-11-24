import { defineChain } from '../../utils/chain/defineChain.js'
import { formattersOptimism } from '../optimism/formatters.js'

export const pgnTestnet = /*#__PURE__*/ defineChain(
  {
    id: 58008,
    network: 'pgn-testnet',
    name: 'PGN ',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: {
        http: ['https://sepolia.publicgoods.network'],
      },
      public: {
        http: ['https://sepolia.publicgoods.network'],
      },
    },
    blockExplorers: {
      default: {
        name: 'PGN Testnet Explorer',
        url: 'https://explorer.sepolia.publicgoods.network',
      },
      blocksout: {
        name: 'PGN Testnet Explorer',
        url: 'https://explorer.sepolia.publicgoods.network',
      },
    },
    contracts: {
      multicall3: {
        address: '0xcA11bde05977b3631167028862bE2a173976CA11',
        blockCreated: 3754925,
      },
    },
    testnet: true,
  },
  {
    formatters: formattersOptimism,
  },
)
