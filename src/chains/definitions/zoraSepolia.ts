import * as Chain from '../../core/Chain.js'
import { chainConfig } from '../../op-stack/chainConfig.js'

const sourceId = 11_155_111 // sepolia

export const zoraSepolia = /*#__PURE__*/ Chain.from({
  ...chainConfig,
  id: 999999999,
  name: 'Zora Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Zora Sepolia',
    symbol: 'ETH',
  },
  rpcUrls: {
    http: 'https://sepolia.rpc.zora.energy',
    ws: 'wss://sepolia.rpc.zora.energy',
  },
  blockExplorers: {
    name: 'Zora Sepolia Explorer',
    url: 'https://sepolia.explorer.zora.energy/',
    apiUrl: 'https://sepolia.explorer.zora.energy/api',
  },
  contracts: {
    ...chainConfig.contracts,
    l2OutputOracle: {
      [sourceId]: {
        address: '0x2615B481Bd3E5A1C0C7Ca3Da1bdc663E8615Ade9',
      },
    },
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 83160,
    },
    portal: {
      [sourceId]: {
        address: '0xeffE2C6cA9Ab797D418f0D91eA60807713f3536f',
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: '0x5376f1D543dcbB5BD416c56C189e4cB7399fCcCB',
      },
    },
  },
  sourceId,
  testnet: true,
})
