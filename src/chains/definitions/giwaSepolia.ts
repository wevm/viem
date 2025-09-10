import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 11_155_111 // sepolia

export const giwaSepolia = defineChain({
  id: 91342,
  name: 'Giwa Sepolia',
  nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://sepolia-rpc.giwa.io'],
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 4151544,
    },
    l2OutputOracle: {},
    disputeGameFactory: {
      [sourceId]: {
        address: '0x37347caB2afaa49B776372279143D71ad1f354F6',
      },
    },
    portal: {
      [sourceId]: {
        address: '0x956962C34687A954e611A83619ABaA37Ce6bC78A',
        blockCreated: 4169142,
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: '0x77b2ffc0F57598cAe1DB76cb398059cF5d10A7E7',
        blockCreated: 4164961,
      },
    },
  },
  testnet: true,
})
