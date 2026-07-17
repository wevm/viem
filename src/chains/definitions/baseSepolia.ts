import * as Chain from '../../core/Chain.js'
import { chainConfig } from '../../op-stack/chainConfig.js'

const sourceId = 11_155_111 // sepolia

export const baseSepolia = /*#__PURE__*/ Chain.from({
  ...chainConfig,
  id: 84532,
  name: 'Base Sepolia',
  nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    http: 'https://sepolia.base.org',
  },
  blockExplorers: {
    name: 'Basescan',
    url: 'https://sepolia.basescan.org',
    apiUrl: 'https://api-sepolia.basescan.org/api',
  },
  contracts: {
    ...chainConfig.contracts,
    disputeGameFactory: {
      [sourceId]: {
        address: '0xd6E6dBf4F7EA0ac412fD8b65ED297e64BB7a06E1',
      },
    },
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
    l1StandardBridge: {
      [sourceId]: {
        address: '0xfd0Bf71F60660E2f608ed56e1659C450eB113120',
        blockCreated: 4446677,
      },
    },
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 1059647,
    },
  },
  testnet: true,
  sourceId,
})

export const baseSepoliaPreconf = /*#__PURE__*/ Chain.from({
  ...baseSepolia,
  preconfirmationTime: 200,
  rpcUrls: {
    http: 'https://sepolia-preconf.base.org',
  },
})
