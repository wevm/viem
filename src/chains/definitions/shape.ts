import { chainConfig } from '../../op-stack/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 1 // mainnet

export const shape = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 360,
  name: 'Shape',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet.shape.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'shapescan',
      url: 'https://shapescan.xyz',
      apiUrl: 'https://shapescan.xyz/api',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    l2OutputOracle: {
      [sourceId]: {
        address: '0x6Ef8c69CfE4635d866e3E02732068022c06e724D',
        blockCreated: 20369940,
      },
    },
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 1,
    },
    portal: {
      [sourceId]: {
        address: '0xEB06fFa16011B5628BaB98E29776361c83741dd3',
        blockCreated: 20369933,
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: '0x62Edd5f4930Ea92dCa3fB81689bDD9b9d076b57B',
        blockCreated: 20369935,
      },
    },
  },
  sourceId,
})
