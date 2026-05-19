import { chainConfig } from '../internal/tempo.js'
import * as Chain from '../../core/Chain.js'

export const tempoLocalnet = /*#__PURE__*/ Chain.define({
  ...chainConfig,
  id: 1337n,
  name: 'Tempo',
  hardfork: 't3',
  nativeCurrency: {
    name: 'USD',
    symbol: 'USD',
    decimals: 6,
  },
  rpcUrls: {
    default: { http: ['http://localhost:8545'] },
  },
})
