import { defineChain } from '../../utils/chain/defineChain.js'
import { formattersOptimism } from '../optimism/formatters.js'

export const pgn = /*#__PURE__*/ defineChain(
  {
    id: 424,
    network: 'pgn',
    name: 'PGN',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: {
        http: ['https://rpc.publicgoods.network'],
      },
      public: {
        http: ['https://rpc.publicgoods.network'],
      },
    },
    blockExplorers: {
      default: {
        name: 'PGN Explorer',
        url: 'https://explorer.publicgoods.network',
      },
      blocksout: {
        name: 'PGN Explorer',
        url: 'https://explorer.publicgoods.network',
      },
    },
    contracts: {
      multicall3: {
        address: '0xcA11bde05977b3631167028862bE2a173976CA11',
        blockCreated: 3380209,
      },
    },
  },
  {
    formatters: formattersOptimism,
  },
)
