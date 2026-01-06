import { chainConfig } from '../../tempo/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

export const tempoModerato = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 42431,
  blockExplorers: {
    default: {
      name: 'Tempo Explorer',
      url: 'https://explore.moderato.tempo.xyz',
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
})
