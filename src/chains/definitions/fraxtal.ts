import { chainConfig } from '../internal/opStack.js'
import * as Chain from '../../core/Chain.js'

const sourceId = 1n // mainnet

export const fraxtal = /*#__PURE__*/ Chain.define({
  ...chainConfig,
  id: 252n,
  name: 'Fraxtal',
  nativeCurrency: { name: 'Frax', symbol: 'FRAX', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.frax.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'fraxscan',
      url: 'https://fraxscan.com',
      apiUrl: 'https://api.fraxscan.com/api',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    l2OutputOracle: {
      [sourceId.toString()]: {
        address: '0x66CC916Ed5C6C2FA97014f7D1cD141528Ae171e4',
      },
    },
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
    },
    portal: {
      [sourceId.toString()]: {
        address: '0x36cb65c1967A0Fb0EEE11569C51C2f2aA1Ca6f6D',
        blockCreated: 19135323,
      },
    },
    l1StandardBridge: {
      [sourceId.toString()]: {
        address: '0x34C0bD5877A5Ee7099D0f5688D65F4bB9158BDE2',
        blockCreated: 19135323,
      },
    },
  },
  sourceId,
})
