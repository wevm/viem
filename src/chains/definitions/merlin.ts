import * as Chain from '../../core/Chain.js'

export const merlin = /*#__PURE__*/ Chain.define({
  id: 4200n,
  name: 'Merlin',
  nativeCurrency: {
    name: 'BTC',
    symbol: 'BTC',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://rpc.merlinchain.io'] },
  },
  blockExplorers: {
    default: {
      name: 'blockscout',
      url: 'https://scan.merlinchain.io',
      apiUrl: 'https://scan.merlinchain.io/api',
    },
  },
})
