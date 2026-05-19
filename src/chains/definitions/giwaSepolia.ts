import { chainConfig } from '../internal/opStack.js'
import * as Chain from '../../core/Chain.js'

const sourceId = 11_155_111n // sepolia

export const giwaSepolia = /*#__PURE__*/ Chain.define({
  ...chainConfig,
  id: 91342n,
  network: 'giwa-sepolia',
  name: 'GIWA Sepolia',
  nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
  blockTime: 1_000,
  rpcUrls: {
    default: {
      http: ['https://sepolia-rpc.giwa.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://sepolia-explorer.giwa.io',
      apiUrl: 'https://sepolia-explorer.giwa.io/api',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 0,
    },
    disputeGameFactory: {
      [sourceId.toString()]: {
        address: '0x37347caB2afaa49B776372279143D71ad1f354F6',
      },
    },
    portal: {
      [sourceId.toString()]: {
        address: '0x956962C34687A954e611A83619ABaA37Ce6bC78A',
      },
    },
    l1StandardBridge: {
      [sourceId.toString()]: {
        address: '0x77b2ffc0F57598cAe1DB76cb398059cF5d10A7E7',
      },
    },
  },
  testnet: true,
  sourceId,
})

export const giwaSepoliaPreconf: Chain.Chain = Chain.define({
  ...giwaSepolia,
  preconfirmationTime: 200,
  rpcUrls: {
    default: {
      http: ['https://sepolia-rpc-flashblocks.giwa.io'],
    },
  },
})
