import { defineChain } from '../../utils/chain/defineChain.js'
import { chainConfig } from '../opStack/chainConfig.js'

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
  contracts: { ...chainConfig.contracts },
  testnet: true,
  sourceId: 11155111, // sepolia
})
