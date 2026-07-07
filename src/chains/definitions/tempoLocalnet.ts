import * as Chain from '../../core/Chain.js'
import { chainConfig } from '../../tempo/chainConfig.js'

export const tempoLocalnet = /*#__PURE__*/ Chain.from({
  ...chainConfig,
  id: 1337,
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
