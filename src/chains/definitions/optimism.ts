import { defineChain } from '../../utils/chain/defineChain.js'
import { opStackL2Contracts } from '../opStack/contracts.js'
import { formattersOpStack } from '../opStack/formatters.js'

export const optimism = /*#__PURE__*/ defineChain({
  id: 10,
  name: 'OP Mainnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet.optimism.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Optimism Explorer',
      url: 'https://explorer.optimism.io',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 4286263,
    },
    ...opStackL2Contracts,
  },
  formatters: formattersOpStack,
})
