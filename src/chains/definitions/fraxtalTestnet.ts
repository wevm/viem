import { chainConfig } from '../../op-stack/chainConfig.js'
import * as Chain from '../../core/Chain.js'

const sourceId = 17000n // holesky

export const fraxtalTestnet = /*#__PURE__*/ Chain.define({
  ...chainConfig,
  id: 2522n,
  name: 'Fraxtal Testnet',
  nativeCurrency: { name: 'Frax', symbol: 'FRAX', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.frax.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'fraxscan testnet',
      url: 'https://holesky.fraxscan.com',
      apiUrl: 'https://api-holesky.fraxscan.com/api',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    l2OutputOracle: {
      [sourceId.toString()]: {
        address: '0x715EA64DA13F4d0831ece4Ad3E8c1aa013167F32',
      },
    },
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
    },
    portal: {
      [sourceId.toString()]: {
        address: '0xB9c64BfA498d5b9a8398Ed6f46eb76d90dE5505d',
        blockCreated: 318416,
      },
    },
    l1StandardBridge: {
      [sourceId.toString()]: {
        address: '0x0BaafC217162f64930909aD9f2B27125121d6332',
        blockCreated: 318416,
      },
    },
  },
  sourceId,
  testnet: true,
})
