import { chainConfig } from '../internal/opStack.js'
import * as Chain from '../../core/Chain.js'

const sourceId = 11_155_111n // sepolia

export const rss3Sepolia = /*#__PURE__*/ Chain.define({
  ...chainConfig,
  id: 2_331n,
  name: 'RSS3 VSL Sepolia Testnet',
  nativeCurrency: { name: 'RSS3', symbol: 'RSS3', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.rss3.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'RSS3 VSL Sepolia Testnet Scan',
      url: 'https://scan.testnet.rss3.io',
      apiUrl: 'https://scan.testnet.rss3.io/api',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    l2OutputOracle: {
      [sourceId.toString()]: {
        address: '0xDb5c46C3Eaa6Ed6aE8b2379785DF7dd029C0dC81',
      },
    },
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 55697,
    },
    portal: {
      [sourceId.toString()]: {
        address: '0xcBD77E8E1E7F06B25baDe67142cdE82652Da7b57',
        blockCreated: 5345035,
      },
    },
    l1StandardBridge: {
      [sourceId.toString()]: {
        address: '0xdDD29bb63B0839FB1cE0eE439Ff027738595D07B',
      },
    },
  },
  testnet: true,
  sourceId,
})
