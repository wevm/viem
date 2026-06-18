import * as Chain from '../../core/Chain.js'

export const xrplevm = /*#__PURE__*/ Chain.from({
  id: 1440000,
  name: 'XRPL EVM',
  nativeCurrency: {
    name: 'XRP',
    symbol: 'XRP',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://rpc.xrplevm.org'] },
  },
  blockExplorers: {
    default: {
      name: 'blockscout',
      url: 'https://explorer.xrplevm.org',
      apiUrl: 'https://explorer.xrplevm.org/api/v2',
    },
  },
  testnet: false,
})
