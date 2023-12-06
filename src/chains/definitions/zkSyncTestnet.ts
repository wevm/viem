import { defineChain } from '../../utils/chain/defineChain.js'
import { formattersZkSync } from '../zksync/formatters.js'
import { serializersZkSync } from '../zksync/serializers.js'

export const zkSyncTestnet = /*#__PURE__*/ defineChain(
  {
    id: 300,
    name: 'zkSync Sepolia Testnet',
    network: 'zksync-sepolia-testnet',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: {
        http: ['https://sepolia.era.zksync.dev'],
        webSocket: ['wss://sepolia.era.zksync.dev/ws'],
      },
      public: {
        http: ['https://sepolia.era.zksync.dev'],
        webSocket: ['wss://sepolia.era.zksync.dev/ws'],
      },
    },
    blockExplorers: {
      default: {
        name: 'zkExplorer',
        url: 'https://sepolia.explorer.zksync.io/',
      },
    },
    testnet: true,
  },
  {
    serializers: serializersZkSync,
    formatters: formattersZkSync,
  },
)
