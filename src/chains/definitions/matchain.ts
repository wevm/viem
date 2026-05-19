import * as Chain from '../../core/Chain.js'

export const matchain = /*#__PURE__*/ Chain.define({
  id: 698n,
  name: 'Matchain',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://rpc.matchain.io'] },
  },
  blockExplorers: {
    default: {
      name: 'Matchain Scan',
      url: 'https://matchscan.io',
    },
  },
})
