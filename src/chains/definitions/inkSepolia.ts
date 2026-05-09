import { chainConfig } from '../../op-stack/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 11_155_111 // sepolia

export const inkSepolia = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 763373,
  name: 'Ink Sepolia',
  nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc-gel-sepolia.inkonchain.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://explorer-sepolia.inkonchain.com/',
      apiUrl: 'https://explorer-sepolia.inkonchain.com/api/v2',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 0,
    },
    disputeGameFactory: {
      [sourceId]: {
        address: '0x860e626c700af381133d9f4af31412a2d1db3d5d',
      },
    },
    portal: {
      [sourceId]: {
        address: '0x5c1d29c6c9c8b0800692acc95d700bcb4966a1d7',
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: '0x33f60714bbd74d62b66d79213c348614de51901c',
      },
    },
  },
  testnet: true,
  sourceId,
})
