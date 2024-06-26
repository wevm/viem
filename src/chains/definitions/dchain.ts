import { chainConfig } from '../../op-stack/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

export const dchain = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 2716446429837000,
  name: 'Dchain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://dchain-2716446429837000-1.jsonrpc.sagarpc.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Dchain Explorer',
      url: 'https://dchain-2716446429837000-1.sagaexplorer.io',
      apiUrl: 'https://api-dchain-2716446429837000-1.sagaexplorer.io/api',
    },
  },
  contracts: {
    ...chainConfig.contracts,
  },
})
