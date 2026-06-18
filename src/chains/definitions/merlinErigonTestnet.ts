import * as Chain from '../../core/Chain.js'

export const merlinErigonTestnet = /*#__PURE__*/ Chain.from({
  id: 4203,
  name: 'Merlin Erigon Testnet',
  nativeCurrency: {
    name: 'BTC',
    symbol: 'BTC',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://testnet-erigon-rpc.merlinchain.io'] },
  },
  blockExplorers: {
    default: {
      name: 'blockscout',
      url: 'https://testnet-erigon-scan.merlinchain.io',
      apiUrl: 'https://testnet-erigon-scan.merlinchain.io/api',
    },
  },
  testnet: true,
})
