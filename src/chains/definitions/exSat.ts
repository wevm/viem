import * as Chain from '../../core/Chain.js'

export const exsat = /*#__PURE__*/ Chain.from({
  id: 7200,
  name: 'exSat Network',
  nativeCurrency: {
    decimals: 18,
    name: 'BTC',
    symbol: 'BTC',
  },
  rpcUrls: { http: 'https://evm.exsat.network' },
  blockExplorers: {
    name: 'exSat Explorer',
    url: 'https://scan.exsat.network',
    apiUrl: 'https://scan.exsat.network/api',
  },
})
