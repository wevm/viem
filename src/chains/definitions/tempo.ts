import { chainConfig } from '../internal/tempo.js'
import * as Chain from '../../core/Chain.js'

export const tempo = /*#__PURE__*/ Chain.define({
  ...chainConfig,
  id: 4217n,
  blockExplorers: {
    default: {
      name: 'Tempo Explorer',
      url: 'https://explore.tempo.xyz',
    },
  },
  name: 'Tempo Mainnet',
  nativeCurrency: {
    name: 'USD',
    symbol: 'USD',
    decimals: 6,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.tempo.xyz'],
      webSocket: ['wss://rpc.tempo.xyz'],
    },
  },
})
