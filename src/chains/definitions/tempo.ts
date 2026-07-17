import * as Chain from '../../core/Chain.js'
import { chainConfig } from '../../tempo/chainConfig.js'

export const tempo = /*#__PURE__*/ Chain.from({
  ...chainConfig,
  id: 4217,
  blockExplorers: {
    name: 'Tempo Explorer',
    url: 'https://explore.tempo.xyz',
  },
  name: 'Tempo Mainnet',
  nativeCurrency: {
    name: 'USD',
    symbol: 'USD',
    decimals: 6,
  },
  rpcUrls: {
    http: 'https://rpc.tempo.xyz',
    ws: 'wss://rpc.tempo.xyz',
  },
})
