import * as Chain from '../../core/Chain.js'
import { chainConfig } from '../../tempo/chainConfig.js'

export const tempoDevnet = /*#__PURE__*/ Chain.from({
  ...chainConfig,
  id: 31318,
  name: 'Tempo Devnet',
  hardfork: 't3',
  blockExplorers: {
    name: 'Tempo Explorer',
    url: 'https://explore.devnet.tempo.xyz',
  },
  contracts: {
    ...chainConfig.contracts,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 0,
    },
  },
  nativeCurrency: {
    name: 'USD',
    symbol: 'USD',
    decimals: 6,
  },
  rpcUrls: {
    http: 'https://rpc.devnet.tempoxyz.dev',
    ws: 'wss://rpc.devnet.tempoxyz.dev',
  },
  testnet: true,
})
