import { defineChain } from '../../utils/chain/defineChain.js'
import { chainConfig } from '../opStack/chainConfig.js'

const sourceId = 11_155_111 // sepolia

export const baseSepolia = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 84532,
  network: 'base-sepolia',
  name: 'Base Sepolia',
  nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
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
  contracts: {
    ...chainConfig.contracts,
    l2OutputOracle: {
      [sourceId]: {
        address: '0x84457ca9D0163FbC4bbfe4Dfbb20ba46e48DF254',
      },
    },
    portal: {
      [sourceId]: {
        address: '0x49f53e41452c74589e85ca1677426ba426459e85',
        blockCreated: 4446677,
      },
    },
  },
  testnet: true,
  sourceId,
})
