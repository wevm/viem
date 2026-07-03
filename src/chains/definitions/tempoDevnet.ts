import * as Chain from '../../core/Chain.js'
import { chainConfig } from '../../tempo/chainConfig.js'

export const tempoDevnet = /*#__PURE__*/ Chain.from({
  ...chainConfig,
  id: 31318,
  hardfork: 't3',
  name: 'Tempo Devnet',
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
