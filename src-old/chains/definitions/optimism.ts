import { chainConfig } from '../../op-stack/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 1 // mainnet

export const optimism = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 10,
  name: 'OP Mainnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet.optimism.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Optimism Explorer',
      url: 'https://optimistic.etherscan.io',
      apiUrl: 'https://api-optimistic.etherscan.io/api',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    disputeGameFactory: {
      [sourceId]: {
        address: '0xe5965Ab5962eDc7477C8520243A95517CD252fA9',
      },
    },
    l2OutputOracle: {
      [sourceId]: {
        address: '0xdfe97868233d1aa22e815a266982f2cf17685a27',
      },
    },
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 4286263,
    },
    portal: {
      [sourceId]: {
        address: '0xbEb5Fc579115071764c7423A4f12eDde41f106Ed',
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: '0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1',
      },
    },
  },
  sourceId,
})
