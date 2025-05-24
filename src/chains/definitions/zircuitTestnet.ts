import { chainConfig } from '../../op-stack/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 11_155_111 // sepolia

export const zircuitTestnet = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 48899,
  name: 'Zircuit Testnet',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        'https://testnet.zircuit.com',
        'https://zircuit1-testnet.p2pify.com',
        'https://zircuit1-testnet.liquify.com',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Zircuit Testnet Explorer',
      url: 'https://explorer.testnet.zircuit.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 6040287,
    },
    l2OutputOracle: {
      [sourceId]: {
        address: '0x740C2dac453aEf7140809F80b72bf0e647af8148',
      },
    },
    portal: {
      [sourceId]: {
        address: '0x787f1C8c5924178689E0560a43D848bF8E54b23e',
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: '0x0545c5fe980098C16fcD0eCB5E79753afa6d9af9',
      },
    },
  },
  testnet: true,
})
