import * as Chain from '../../core/Chain.js'

export const bronos = /*#__PURE__*/ Chain.define({
  id: 1039n,
  name: 'Bronos',
  nativeCurrency: {
    decimals: 18,
    name: 'BRO',
    symbol: 'BRO',
  },
  rpcUrls: {
    default: { http: ['https://evm.bronos.org'] },
  },
  blockExplorers: {
    default: {
      name: 'BronoScan',
      url: 'https://broscan.bronos.org',
    },
  },
})
