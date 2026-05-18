import { chainConfig } from '../../op-stack/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 11_155_111 // sepolia

export const worldchainSepolia = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 4801,
  name: 'World Chain Sepolia',
  network: 'worldchain-sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://worldchain-sepolia.g.alchemy.com/public'] },
  },
  blockExplorers: {
    default: {
      name: 'Worldscan Sepolia',
      url: 'https://sepolia.worldscan.org',
      apiUrl: 'https://api-sepolia.worldscan.org/api',
    },
    blockscout: {
      name: 'Blockscout',
      url: 'https://worldchain-sepolia.explorer.alchemy.com',
      apiUrl: 'https://worldchain-sepolia.explorer.alchemy.com/api',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 0,
    },
    disputeGameFactory: {
      [sourceId]: {
        address: '0x8Ec1111f67Dad6b6A93B3F42DfBC92D81c98449A',
      },
    },
    l2OutputOracle: {
      [sourceId]: {
        address: '0xc8886f8BAb6Eaeb215aDB5f1c686BF699248300e',
      },
    },
    portal: {
      [sourceId]: {
        address: '0xFf6EBa109271fe6d4237EeeD4bAb1dD9A77dD1A4',
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: '0xd7DF54b3989855eb66497301a4aAEc33Dbb3F8DE',
      },
    },
  },
  testnet: true,
  sourceId,
})
