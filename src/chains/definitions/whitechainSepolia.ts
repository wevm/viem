import { chainConfig } from '../../op-stack/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 11_155_111 // sepolia

export const whitechainSepolia = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 1874,
  name: 'Whitechain Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'WBT',
    symbol: 'WBT',
  },
  blockTime: 1_000,
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.whitechain.io'],
      webSocket: ['wss://rpc.testnet.whitechain.io/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Whitechain Testnet Explorer',
      url: 'https://explorer.testnet.whitechain.io',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    },
    disputeGameFactory: {
      [sourceId]: {
        address: '0xfaa2fAA8912C069c01abc169c33713c79027c833',
      },
    },
    portal: {
      [sourceId]: {
        address: '0xFF9b597b0781457ae6aa7256Ca5ed5839bF7D0C3',
        blockCreated: 11071328,
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: '0x0c50bE539AB5D72d226038928F2eB25100899DED',
        blockCreated: 11071328,
      },
    },
  },
  testnet: true,
  sourceId,
})
