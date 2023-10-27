import { defineChain } from '../../utils/chain/defineChain.js'
import { formattersOptimism } from '../optimism/formatters.js'

export const base = /*#__PURE__*/ defineChain(
  {
    id: 8453,
    network: 'base',
    name: 'Base',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      alchemy: {
        http: ['https://base-mainnet.g.alchemy.com/v2'],
        webSocket: ['wss://base-mainnet.g.alchemy.com/v2'],
      },
      infura: {
        http: ['https://base-mainnet.infura.io/v3'],
        webSocket: ['wss://base-mainnet.infura.io/ws/v3'],
      },
      default: {
        http: ['https://mainnet.base.org'],
      },
      public: {
        http: ['https://mainnet.base.org'],
      },
    },
    blockExplorers: {
      blockscout: {
        name: 'Basescout',
        url: 'https://base.blockscout.com',
      },
      default: {
        name: 'Basescan',
        url: 'https://basescan.org',
      },
      etherscan: {
        name: 'Basescan',
        url: 'https://basescan.org',
      },
    },
    contracts: {
      multicall3: {
        address: '0xca11bde05977b3631167028862be2a173976ca11',
        blockCreated: 5022,
      },
    },
  },
  {
    formatters: formattersOptimism,
  },
)
