import * as Chain from '../../core/Chain.js'

export const bronos = /*#__PURE__*/ Chain.from({
  id: 1039,
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
