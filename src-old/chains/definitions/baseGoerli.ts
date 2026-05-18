import { chainConfig } from '../../op-stack/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 5 // goerli

export const baseGoerli = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 84531,
  name: 'Base Goerli',
  nativeCurrency: { name: 'Goerli Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://goerli.base.org'] },
  },
  blockExplorers: {
    default: {
      name: 'Basescan',
      url: 'https://goerli.basescan.org',
      apiUrl: 'https://goerli.basescan.org/api',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    l2OutputOracle: {
      [sourceId]: {
        address: '0x2A35891ff30313CcFa6CE88dcf3858bb075A2298',
      },
    },
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 1376988,
    },
    portal: {
      [sourceId]: {
        address: '0xe93c8cD0D409341205A592f8c4Ac1A5fe5585cfA',
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: '0xfA6D8Ee5BE770F84FC001D098C4bD604Fe01284a',
      },
    },
  },
  testnet: true,
  sourceId,
})
