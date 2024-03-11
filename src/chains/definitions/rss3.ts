import { defineChain } from '../../utils/chain/defineChain.js'
import { chainConfig } from '../opStack/chainConfig.js'

const sourceId = 1 // mainnet

export const rss3 = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 12_553,
  name: 'RSS3 VSL Mainnet',
  nativeCurrency: { name: 'RSS3', symbol: 'RSS3', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.rss3.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'RSS3 VSL Mainnet Scan',
      url: 'https://scan.rss3.io',
      apiUrl: 'https://scan.rss3.io/api',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    l2OutputOracle: {
      [sourceId]: {
        address: '0xE6f24d2C32B3109B18ed33cF08eFb490b1e09C10',
      },
    },
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 14193,
    },
    portal: {
      [sourceId]: {
        address: '0x6A12432491bbbE8d3babf75F759766774C778Db4',
        blockCreated: 19387057,
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: '0x4cbab69108Aa72151EDa5A3c164eA86845f18438',
      },
    },
  },
  sourceId,
})
