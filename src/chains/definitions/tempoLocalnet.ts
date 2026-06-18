import * as Chain from '../../core/Chain.js'

export const tempoLocalnet = /*#__PURE__*/ Chain.from({
  id: 1337,
  name: 'Tempo',
  nativeCurrency: {
    name: 'USD',
    symbol: 'USD',
    decimals: 6,
  },
  rpcUrls: {
    default: { http: ['http://localhost:8545'] },
  },
})
