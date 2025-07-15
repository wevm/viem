import { chainConfig } from '../../op-stack/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 11_155_111 // sepolia

export const bobSepolia = defineChain({
  ...chainConfig,
  id: 808813,
  name: 'BOB Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://bob-sepolia.rpc.gobob.xyz'],
      webSocket: ['wss://bob-sepolia.rpc.gobob.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BOB Sepolia Explorer',
      url: 'https://bob-sepolia.explorer.gobob.xyz',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 35677,
    },
    l2OutputOracle: {
      [sourceId]: {
        address: '0x14D0069452b4AE2b250B395b8adAb771E4267d2f',
        blockCreated: 4462615,
      },
    },
    portal: {
      [sourceId]: {
        address: '0xBAAf3BAfdbd660380938b27d21c31bB7D072a799',
        blockCreated: 6404317,
      },
    },
    disputeGameFactory: {
      [sourceId]: {
        address: '0x7a25d06Af869d0A94f6effAfFa0A830EEBF1EcfB',
        blockCreated: 8591637,
      },
    },
  },
  testnet: true,
  sourceId,
})
