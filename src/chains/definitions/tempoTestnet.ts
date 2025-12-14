import { chainConfig } from '../../tempo/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

export const tempoTestnet = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 42429,
  blockExplorers: {
    default: {
      name: 'Tempo Explorer',
      url: 'https://explore.tempo.xyz',
    },
  },
  name: 'Tempo Testnet',
  nativeCurrency: {
    name: 'USD',
    symbol: 'USD',
    decimals: 6,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.tempo.xyz'],
      webSocket: ['wss://rpc.testnet.tempo.xyz'],
    },
  },
})
