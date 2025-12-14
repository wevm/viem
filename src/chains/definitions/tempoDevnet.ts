import { chainConfig } from '../../tempo/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

export const tempoDevnet = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 1337,
  name: 'Tempo Devnet',
  nativeCurrency: {
    name: 'USD',
    symbol: 'USD',
    decimals: 6,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.devnet.tempo.xyz'],
      webSocket: ['wss://rpc.devnet.tempo.xyz'],
    },
  },
})
