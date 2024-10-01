import { chainConfig } from '../../celo/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 17000 // holsky
// source https://storage.googleapis.com/cel2-rollup-files/alfajores/deployment-l1.json

export const celoAlfajores = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 44_787,
  name: 'Alfajores',
  nativeCurrency: {
    decimals: 18,
    name: 'CELO',
    symbol: 'A-CELO',
  },
  rpcUrls: {
    default: {
      http: ['https://alfajores-forno.celo-testnet.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Celo Alfajores Explorer',
      url: 'https://celo-alfajores.blockscout.com',
      apiUrl: 'https://celo-alfajores.blockscout.com/api',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 14569001,
    },
    portal: {
      [sourceId]: {
        address: '0x82527353927d8D069b3B452904c942dA149BA381',
        blockCreated: 2411324,
      },
    },
    disputeGameFactory: {
      [sourceId]: {
        address: '0xE28AAdcd9883746c0e5068F58f9ea06027b214cb',
        blockCreated: 2411324,
      },
    },
    l2OutputOracle: {
      [sourceId]: {
        address: '0x4a2635e9e4f6e45817b1D402ac4904c1d1752438',
        blockCreated: 2411324,
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: '0xD1B0E0581973c9eB7f886967A606b9441A897037',
        blockCreated: 2411324,
      },
    },
  },
  testnet: true,
})
