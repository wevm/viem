import { defineChain } from '../../utils/chain/defineChain.js'
import { opStackL2Contracts } from '../opStack/contracts.js'
import { formattersOpStack } from '../opStack/formatters.js'

export const baseGoerli = /*#__PURE__*/ defineChain({
  id: 84531,
  name: 'Base Goerli',
  nativeCurrency: { name: 'Goerli Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://goerli.base.org'] },
  },
  blockExplorers: {
    default: {
      name: 'Basescan',
      url: 'https://goerli.basescan.org',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 1376988,
    },
    ...opStackL2Contracts,
  },
  testnet: true,
  sourceId: 5, // goerli
  formatters: formattersOpStack,
})
