import { chainConfig } from '../../op-stack/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 1 // mainnet

export const blast = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 81457,
  name: 'Blast',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://rpc.blast.io'] },
  },
  blockExplorers: {
    default: {
      name: 'Blastscan',
      url: 'https://blastscan.io',
      apiUrl: 'https://api.blastscan.io/api',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 212929,
    },
    l2OutputOracle: {
      [sourceId]: {
        address: '0x826D1B0D4111Ad9146Eb8941D7Ca2B6a44215c76',
        blockCreated: 19300358,
      },
    },
    portal: {
      [sourceId]: {
        address: '0x0Ec68c5B10F21EFFb74f2A5C61DFe6b08C0Db6Cb',
        blockCreated: 19300357,
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: '0x697402166Fbf2F22E970df8a6486Ef171dbfc524',
        blockCreated: 19300360,
      },
    },
  },
  sourceId,
})
