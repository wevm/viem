import { chainConfig } from '../internal/opStack.js'
import * as Chain from '../../core/Chain.js'

const sourceId = 5n // goerli

export const optimismGoerli = /*#__PURE__*/ Chain.define({
  ...chainConfig,
  id: 420n,
  name: 'Optimism Goerli',
  nativeCurrency: { name: 'Goerli Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://goerli.optimism.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Etherscan',
      url: 'https://goerli-optimism.etherscan.io',
      apiUrl: 'https://goerli-optimism.etherscan.io/api',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    l2OutputOracle: {
      [sourceId.toString()]: {
        address: '0xE6Dfba0953616Bacab0c9A8ecb3a9BBa77FC15c0',
      },
    },
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 49461,
    },
    portal: {
      [sourceId.toString()]: {
        address: '0x5b47E1A08Ea6d985D6649300584e6722Ec4B1383',
      },
    },
    l1StandardBridge: {
      [sourceId.toString()]: {
        address: '0x636Af16bf2f682dD3109e60102b8E1A089FedAa8',
      },
    },
  },
  testnet: true,
  sourceId,
})
