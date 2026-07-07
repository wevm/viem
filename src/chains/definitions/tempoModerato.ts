import * as Chain from '../../core/Chain.js'
import { chainConfig } from '../../tempo/chainConfig.js'

export const tempoModerato = /*#__PURE__*/ Chain.from({
  ...chainConfig,
  id: 42431,
  hardfork: 't5',
  blockExplorers: {
    default: {
      name: 'Tempo Explorer',
      url: 'https://explore.testnet.tempo.xyz',
    },
  },
  name: 'Tempo Testnet (Moderato)',
  nativeCurrency: {
    name: 'USD',
    symbol: 'USD',
    decimals: 6,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.moderato.tempo.xyz'],
      webSocket: ['wss://rpc.moderato.tempo.xyz'],
    },
  },
  testnet: true,
})
