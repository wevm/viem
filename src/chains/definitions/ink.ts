import { chainConfig } from '../../op-stack/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 1 // mainnet

export const ink = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 57073,
  name: 'Ink',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        'https://rpc-gel.inkonchain.com',
        'https://rpc-qnd.inkonchain.com',
      ],
      webSocket: [
        'wss://rpc-gel.inkonchain.com',
        'wss://rpc-qnd.inkonchain.com',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://explorer.inkonchain.com',
      apiUrl: 'https://explorer.inkonchain.com/api/v2',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    disputeGameFactory: {
      [sourceId]: {
        address: '0x10d7b35078d3baabb96dd45a9143b94be65b12cd',
      },
    },
    portal: {
      [sourceId]: {
        address: '0x5d66c1782664115999c47c9fa5cd031f495d3e4f',
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: '0x88ff1e5b602916615391f55854588efcbb7663f0',
      },
    },
  },
  testnet: false,
  sourceId,
})
