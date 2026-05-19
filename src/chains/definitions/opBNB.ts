import { chainConfig } from '../../op-stack/chainConfig.js'
import * as Chain from '../../core/Chain.js'

const sourceId = 56n // bsc mainnet

export const opBNB = /*#__PURE__*/ Chain.define({
  id: 204n,
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
      name: 'opBNB (BSCScan)',
      url: 'https://opbnb.bscscan.com',
      apiUrl: 'https://api-opbnb.bscscan.com/api',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 512881,
    },
    l2OutputOracle: {
      [sourceId.toString()]: {
        address: '0x153CAB79f4767E2ff862C94aa49573294B13D169',
      },
    },
    portal: {
      [sourceId.toString()]: {
        address: '0x1876EA7702C0ad0C6A2ae6036DE7733edfBca519',
      },
    },
    l1StandardBridge: {
      [sourceId.toString()]: {
        address: '0xF05F0e4362859c3331Cb9395CBC201E3Fa6757Ea',
      },
    },
  },
  sourceId,
})
