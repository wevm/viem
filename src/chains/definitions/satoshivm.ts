import * as Chain from '../../core/Chain.js'

export const satoshiVM = /*#__PURE__*/ Chain.from({
  id: 3109,
  name: 'SatoshiVM Alpha Mainnet',
  nativeCurrency: {
    name: 'BTC',
    symbol: 'BTC',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://alpha-rpc-node-http.svmscan.io'] },
  },
  blockExplorers: {
    default: {
      name: 'blockscout',
      url: 'https://svmscan.io',
      apiUrl: 'https://svmscan.io/api',
    },
  },
})
