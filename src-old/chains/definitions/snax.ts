import { chainConfig } from '../../op-stack/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 1 // mainnet

export const snax = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 2192,
  network: 'snaxchain-mainnet',
  name: 'SnaxChain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet.snaxchain.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Snax Explorer',
      url: 'https://explorer.snaxchain.io',
      apiUrl: 'https://explorer.snaxchain.io/api',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    disputeGameFactory: {
      [sourceId]: {
        address: '0x472562Fcf26D6b2793f8E0b0fB660ba0E5e08A46',
      },
    },
    l2OutputOracle: {
      [sourceId]: {
        address: '0x2172e492Fc807F5d5645D0E3543f139ECF539294',
      },
    },
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
    },
    portal: {
      [sourceId]: {
        address: '0x79f446D024d74D0Bb6E699C131c703463c5D65E9',
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: '0x6534Bdb6b5c060d3e6aa833433333135eFE8E0aA',
      },
    },
  },
  sourceId,
})
