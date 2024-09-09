import { chainConfig } from '../../op-stack/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 11_155_111 // sepolia

export const shapeSepolia = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 11_011,
  name: 'Shape Sepolia Testnet',
  nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://sepolia.shape.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'blockscout',
      url: 'https://explorer-sepolia.shape.network/',
      apiUrl: 'https://explorer-sepolia.shape.network/api/v2',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 1,
    },
    portal: {
      [sourceId]: {
        address: '0xeffE2C6cA9Ab797D418f0D91eA60807713f3536f',
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: '0x5376f1D543dcbB5BD416c56C189e4cB7399fCcCB',
      },
    },
    l2OutputOracle: {
      [sourceId]: {
        address: '0x84457ca9D0163FbC4bbfe4Dfbb20ba46e48DF254',
      },
    },
  },
  testnet: true,
  sourceId,
})
