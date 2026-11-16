import { chainConfig } from '../../op-stack/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 1 // mainnet

export const whitechain = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 1875,
  name: 'Whitechain',
  nativeCurrency: {
    decimals: 18,
    name: 'WhiteBIT Coin',
    symbol: 'WBT',
  },
  blockTime: 1_000,
  rpcUrls: {
    default: {
      http: ['https://rpc.whitechain.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Whitechain Explorer',
      url: 'https://explorer.whitechain.io',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 50961390,
    },
    disputeGameFactory: {
      [sourceId]: {
        address: '0x1De4f415Dc5bF6e458Cf32d13452c24A35Ec90e3',
      },
    },
    portal: {
      [sourceId]: {
        address: '0x0665f74e013b7FCcfDa6dAF8951bAf3C982a3864',
        blockCreated: 26274053,
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: '0x7e954f20F24b7988EA966C4E7880fe6D21dCc2D9',
        blockCreated: 26274053,
      },
    },
  },
  testnet: false,
  sourceId,
})
