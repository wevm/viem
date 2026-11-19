import { chainConfig } from '../../op-stack/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 8453 // base

export const rwaChain = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 7741,
  name: 'RWA Chain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  blockTime: 1_000,
  rpcUrls: {
    default: {
      http: ['https://rpc.rwa-chain.io'],
      webSocket: ['wss://ws.rwa-chain.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'RWA Chain Explorer',
      url: 'https://explorer.rwa-chain.io',
      apiUrl: 'https://explorer.rwa-chain.io/api',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 0,
    },
    disputeGameFactory: {
      [sourceId]: {
        address: '0x99D4D6b9FABc9C3A4C5E370263B49c9CF9Eb6DFF',
      },
    },
    portal: {
      [sourceId]: {
        address: '0x63832e6a88feb9fa0af1b9c67bbcef9fe6a41cae',
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: '0x1bf527a4298e51051fa1a8db7c18c32827fa50d2',
      },
    },
  },
  sourceId,
})
