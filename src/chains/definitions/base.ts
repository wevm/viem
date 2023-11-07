import { defineChain } from '../../utils/chain/defineChain.js'
import { opStackL2Contracts } from '../opStack/contracts.js'
import { formattersOpStack } from '../opStack/formatters.js'

export const base = /*#__PURE__*/ defineChain({
  id: 8453,
  name: 'Base',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet.base.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Basescan',
      url: 'https://basescan.org',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 5022,
    },
    ...opStackL2Contracts,
  },
  formatters: formattersOpStack,
})
