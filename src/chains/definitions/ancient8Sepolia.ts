import { chainConfig } from '../../op-stack/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 11_155_111 // sepolia

export const ancient8Sepolia = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 28122024,
  name: 'Ancient8 Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpcv2-testnet.ancient8.gg'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Ancient8 Celestia Testnet explorer',
      url: 'https://scanv2-testnet.ancient8.gg',
      apiUrl: 'https://scanv2-testnet.ancient8.gg/api',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    l2OutputOracle: {
      [sourceId]: {
        address: '0x942fD5017c0F60575930D8574Eaca13BEcD6e1bB',
      },
    },
    portal: {
      [sourceId]: {
        address: '0xfa1d9E26A6aCD7b22115D27572c1221B9803c960',
        blockCreated: 4972908,
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: '0xF6Bc0146d3c74D48306e79Ae134A260E418C9335',
        blockCreated: 4972908,
      },
    },
  },
  sourceId,
})
