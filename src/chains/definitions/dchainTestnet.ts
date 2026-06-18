import * as Chain from '../../core/Chain.js'

export const dchainTestnet = /*#__PURE__*/ Chain.from({
  id: 2713017997578000,
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
  contracts: {},
  testnet: true,
})
