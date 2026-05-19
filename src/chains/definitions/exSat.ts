import * as Chain from '../../core/Chain.js'

export const exsat = /*#__PURE__*/ Chain.define({
  id: 7200n,
  name: 'exSat Network',
  nativeCurrency: {
    decimals: 18,
    name: 'BTC',
    symbol: 'BTC',
  },
  rpcUrls: {
    default: { http: ['https://evm.exsat.network'] },
  },
  blockExplorers: {
    default: {
      name: 'exSat Explorer',
      url: 'https://scan.exsat.network',
      apiUrl: 'https://scan.exsat.network/api',
    },
  },
})
