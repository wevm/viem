import { chainConfig } from '../internal/opStack.js'
import * as Chain from '../../core/Chain.js'

export const dchainTestnet = /*#__PURE__*/ Chain.define({
  ...chainConfig,
  id: 2713017997578000n,
  name: 'Dchain Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        'https://dchaintestnet-2713017997578000-1.jsonrpc.testnet.sagarpc.io',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Dchain Explorer',
      url: 'https://dchaintestnet-2713017997578000-1.testnet.sagaexplorer.io',
      apiUrl:
        'https://api-dchaintestnet-2713017997578000-1.testnet.sagaexplorer.io/api',
    },
  },
  contracts: {
    ...chainConfig.contracts,
  },
  testnet: true,
})
