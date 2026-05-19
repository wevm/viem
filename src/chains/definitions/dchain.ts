import { chainConfig } from '../internal/opStack.js'
import * as Chain from '../../core/Chain.js'

export const dchain = /*#__PURE__*/ Chain.define({
  ...chainConfig,
  id: 2716446429837000n,
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
