import { chainConfig } from '../internal/opStack.js'
import * as Chain from '../../core/Chain.js'

const sourceId = 1n // mainnet

export const ink = /*#__PURE__*/ Chain.define({
  ...chainConfig,
  id: 57073n,
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
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 0,
    },
    ...chainConfig.contracts,
    disputeGameFactory: {
      [sourceId.toString()]: {
        address: '0x10d7b35078d3baabb96dd45a9143b94be65b12cd',
      },
    },
    portal: {
      [sourceId.toString()]: {
        address: '0x5d66c1782664115999c47c9fa5cd031f495d3e4f',
      },
    },
    l1StandardBridge: {
      [sourceId.toString()]: {
        address: '0x88ff1e5b602916615391f55854588efcbb7663f0',
      },
    },
  },
  testnet: false,
  sourceId,
})
