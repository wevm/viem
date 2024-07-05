import { chainConfig } from '../../op-stack/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 11_155_111 // sepolia

export const optimismSepolia = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 11155420,
  name: 'OP Sepolia',
  nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://sepolia.optimism.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://optimism-sepolia.blockscout.com',
      apiUrl: 'https://optimism-sepolia.blockscout.com/api',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    disputeGameFactory: {
      [sourceId]: {
        address: '0x05F9613aDB30026FFd634f38e5C4dFd30a197Fa1',
      },
    },
    l2OutputOracle: {
      [sourceId]: {
        address: '0x90E9c4f8a994a250F6aEfd61CAFb4F2e895D458F',
      },
    },
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 1620204,
    },
    portal: {
      [sourceId]: {
        address: '0x16Fc5058F25648194471939df75CF27A2fdC48BC',
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: '0xFBb0621E0B23b5478B630BD55a5f21f67730B0F1',
      },
    },
  },
  testnet: true,
  sourceId,
})
