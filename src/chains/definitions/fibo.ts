import * as Chain from '../../core/Chain.js'

export const fibo = /*#__PURE__*/ Chain.from({
  id: 12306,
  name: 'Fibo Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'fibo',
    symbol: 'FIBO',
  },
  rpcUrls: {
    default: { http: ['https://network.hzroc.art'] },
  },
  blockExplorers: {
    default: {
      name: 'FiboScan',
      url: 'https://scan.fibochain.org',
    },
  },
})
