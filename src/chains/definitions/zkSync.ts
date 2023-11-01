import { defineChain } from '../../utils/chain/defineChain.js'
import { formattersZkSync } from '../zksync/formatters.js'
import { serializersZkSync } from '../zksync/serializers.js'

export const zkSync = /*#__PURE__*/ defineChain(
  {
    id: 324,
    name: 'zkSync Era',
    network: 'zksync-era',
    nativeCurrency: {
      decimals: 18,
      name: 'Ether',
      symbol: 'ETH',
    },
    rpcUrls: {
      default: {
        http: ['https://mainnet.era.zksync.io'],
        webSocket: ['wss://mainnet.era.zksync.io/ws'],
      },
      public: {
        http: ['https://mainnet.era.zksync.io'],
        webSocket: ['wss://mainnet.era.zksync.io/ws'],
      },
    },
    blockExplorers: {
      default: {
        name: 'zkExplorer',
        url: 'https://explorer.zksync.io',
      },
    },
    contracts: {
      multicall3: {
        address: '0xF9cda624FBC7e059355ce98a31693d299FACd963',
      },
    },
  },
  {
    serializers: serializersZkSync,
    formatters: formattersZkSync,
  },
)
