import { defineChain } from '../../utils/chain/defineChain.js'
import { formattersOptimism } from '../optimism/formatters.js'

export const zora = /*#__PURE__*/ defineChain(
  {
    id: 7777777,
    name: 'Zora',
    network: 'zora',
    nativeCurrency: {
      decimals: 18,
      name: 'Ether',
      symbol: 'ETH',
    },
    rpcUrls: {
      default: {
        http: ['https://rpc.zora.energy'],
        webSocket: ['wss://rpc.zora.energy'],
      },
      public: {
        http: ['https://rpc.zora.energy'],
        webSocket: ['wss://rpc.zora.energy'],
      },
    },
    blockExplorers: {
      default: { name: 'Explorer', url: 'https://explorer.zora.energy' },
    },
    contracts: {
      multicall3: {
        address: '0xcA11bde05977b3631167028862bE2a173976CA11',
        blockCreated: 5882,
      },
    },
  },
  {
    formatters: formattersOptimism,
  },
)
