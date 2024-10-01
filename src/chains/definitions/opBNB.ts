import { chainConfig } from '../../op-stack/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 56 // bsc mainnet

export const opBNB = /*#__PURE__*/ defineChain({
  id: 204,
  name: 'opBNB',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://opbnb-mainnet-rpc.bnbchain.org'] },
  },
  blockExplorers: {
    default: {
      name: 'opbnbscan',
      url: 'https://mainnet.opbnbscan.com',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 512881,
    },
    l2OutputOracle: {
      [sourceId]: {
        address: '0x153CAB79f4767E2ff862C94aa49573294B13D169',
      },
    },
    portal: {
      [sourceId]: {
        address: '0x1876EA7702C0ad0C6A2ae6036DE7733edfBca519',
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: '0xF05F0e4362859c3331Cb9395CBC201E3Fa6757Ea',
      },
    },
  },
  sourceId,
})
