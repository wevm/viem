import { chainConfig } from '../internal/opStack.js'
import * as Chain from '../../core/Chain.js'

const sourceId = 1n // mainnet

export const ancient8 = /*#__PURE__*/ Chain.define({
  ...chainConfig,
  id: 888888888n,
  name: 'Ancient8',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.ancient8.gg'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Ancient8 explorer',
      url: 'https://scan.ancient8.gg',
      apiUrl: 'https://scan.ancient8.gg/api',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    l2OutputOracle: {
      [sourceId.toString()]: {
        address: '0xB09DC08428C8b4EFB4ff9C0827386CDF34277996',
      },
    },
    portal: {
      [sourceId.toString()]: {
        address: '0x639F2AECE398Aa76b07e59eF6abe2cFe32bacb68',
        blockCreated: 19070571,
      },
    },
    l1StandardBridge: {
      [sourceId.toString()]: {
        address: '0xd5e3eDf5b68135D559D572E26bF863FBC1950033',
        blockCreated: 19070571,
      },
    },
  },
  sourceId,
})
