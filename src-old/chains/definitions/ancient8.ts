import { chainConfig } from '../../op-stack/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 1 // mainnet

export const ancient8 = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 888888888,
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
      [sourceId]: {
        address: '0xB09DC08428C8b4EFB4ff9C0827386CDF34277996',
      },
    },
    portal: {
      [sourceId]: {
        address: '0x639F2AECE398Aa76b07e59eF6abe2cFe32bacb68',
        blockCreated: 19070571,
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: '0xd5e3eDf5b68135D559D572E26bF863FBC1950033',
        blockCreated: 19070571,
      },
    },
  },
  sourceId,
})
