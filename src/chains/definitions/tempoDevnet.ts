import { chainConfig } from '../internal/tempo.js'
import * as Chain from '../../core/Chain.js'

export const tempoDevnet = /*#__PURE__*/ Chain.define({
  ...chainConfig,
  id: 31318n,
  name: 'Tempo Devnet',
  hardfork: 't3',
  blockExplorers: {
    default: {
      name: 'Tempo Explorer',
      url: 'https://explore.devnet.tempo.xyz',
    },
  },
  nativeCurrency: {
    name: 'USD',
    symbol: 'USD',
    decimals: 6,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.devnet.tempoxyz.dev'],
      webSocket: ['wss://rpc.devnet.tempoxyz.dev'],
    },
  },
  testnet: true,
})
