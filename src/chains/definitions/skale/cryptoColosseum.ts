import { defineChain } from '../../../utils/chain/defineChain.js'

export const skaleCryptoColosseum = /*#__PURE__*/ defineChain({
  id: 1_032_942_172,
  name: 'SKALE | Crypto Colosseum',
  nativeCurrency: { name: 'sFUEL', symbol: 'sFUEL', decimals: 18 },
  rpcUrls: {
    default: {
      http: [],
      webSocket: [],
    },
  },
  blockExplorers: {},
  contracts: {},
})
