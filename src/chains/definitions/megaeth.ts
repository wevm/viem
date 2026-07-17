import * as Chain from '../../core/Chain.js'
import { chainConfig } from '../../op-stack/chainConfig.js'

const sourceId = 1 // mainnet

export const megaeth = /*#__PURE__*/ Chain.from({
  ...chainConfig,
  id: 4326,
  blockTime: 1_000,
  name: 'MegaETH',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://mainnet.megaeth.com/rpc',
    ws: 'wss://mainnet.megaeth.com/ws',
  },
  blockExplorers: {
    name: 'Etherscan',
    url: 'https://mega.etherscan.io',
    apiUrl: 'https://api.etherscan.io/v2/api',
  },
  contracts: {
    ...chainConfig.contracts,
    disputeGameFactory: {
      [sourceId]: {
        address: '0x8546840adF796875cD9AAcc5B3B048f6B2c9D563',
      },
    },
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 0,
    },
    portal: {
      [sourceId]: {
        address: '0x7f82f57F0Dd546519324392e408b01fcC7D709e8',
        blockCreated: 21644285,
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: '0x0CA3A2FBC3D770b578223FBB6b062fa875a2eE75',
        blockCreated: 21644285,
      },
    },
  },
  sourceId,
})
