import { defineChain } from '../../utils/chain/defineChain.js'
import { chainConfig } from '../opStack/chainConfig.js'

const sourceId = 1 // mainnet

export const zora = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 7777777,
  name: 'Zora',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.zora.energy'],
      webSocket: ['wss://rpc.zora.energy'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Explorer',
      url: 'https://explorer.zora.energy',
      apiUrl: 'https://explorer.zora.energy/api',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    l2OutputOracle: {
      [sourceId]: {
        address: '0x9E6204F750cD866b299594e2aC9eA824E2e5f95c',
      },
    },
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 5882,
    },
    portal: {
      [sourceId]: {
        address: '0x1a0ad011913A150f69f6A19DF447A0CfD9551054',
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: '0x3e2Ea9B92B7E48A52296fD261dc26fd995284631',
      },
    },
  },
  sourceId,
})
