import { chainConfig } from '../../op-stack/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 11_155_111 // sepolia

export const soneiumMinato = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 1946,
  name: 'Soneium Minato Testnet',
  nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.minato.soneium.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://explorer-testnet.soneium.org',
      apiUrl: 'https://explorer-testnet.soneium.org/api',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    disputeGameFactory: {
      [sourceId]: {
        address: '0xF69dB6cA559C52d9A4BB6e2B2901f490Ca35Fbf6',
      },
    },
    l2OutputOracle: {
      [sourceId]: {
        address: '0x710e5286C746eC38beeB7538d0146f60D27be343',
      },
    },
    portal: {
      [sourceId]: {
        address: '0x65ea1489741A5D72fFdD8e6485B216bBdcC15Af3',
        blockCreated: 6466136,
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: '0x5f5a404A5edabcDD80DB05E8e54A78c9EBF000C2',
        blockCreated: 6466136,
      },
    },
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 1,
    },
  },
  testnet: true,
  sourceId,
})
