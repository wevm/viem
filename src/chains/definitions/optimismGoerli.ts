import { defineChain } from '../../utils/chain/defineChain.js'
import { opStackL2Contracts } from '../opStack/contracts.js'
import { formattersOpStack } from '../opStack/formatters.js'

export const optimismGoerli = /*#__PURE__*/ defineChain({
  id: 420,
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
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 49461,
    },
    ...opStackL2Contracts,
  },
  testnet: true,
  formatters: formattersOpStack,
})
