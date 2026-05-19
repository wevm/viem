import * as Chain from '../../core/Chain.js'

export const satoshiVMTestnet = /*#__PURE__*/ Chain.define({
  id: 3110n,
  name: 'SatoshiVM Testnet',
  nativeCurrency: {
    name: 'BTC',
    symbol: 'BTC',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://test-rpc-node-http.svmscan.io'] },
  },
  blockExplorers: {
    default: {
      name: 'blockscout',
      url: 'https://testnet.svmscan.io',
      apiUrl: 'https://testnet.svmscan.io/api',
    },
  },
  testnet: true,
})
