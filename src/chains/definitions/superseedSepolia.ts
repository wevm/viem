import { chainConfig } from '../internal/opStack.js'
import * as Chain from '../../core/Chain.js'

const sourceId = 11155111n // sepolia

export const superseedSepolia = /*#__PURE__*/ Chain.define({
  ...chainConfig,
  id: 53302n,
  name: 'Superseed Sepolia',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia.superseed.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Superseed Sepolia Explorer',
      url: 'https://sepolia-explorer.superseed.xyz',
      apiUrl: 'https://sepolia-explorer.superseed.xyz/api/v2',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    },
    portal: {
      [sourceId.toString()]: {
        address: '0x7A0db8C51432d2C3eb4e8f360a2EeB26FF2809fB',
        blockCreated: 5523438,
      },
    },
    l1StandardBridge: {
      [sourceId.toString()]: {
        address: '0x2B227A603fAAdB3De0ED050b63ADD232B5f2c28C',
        blockCreated: 5523442,
      },
    },
  },
  testnet: true,
  sourceId,
})
