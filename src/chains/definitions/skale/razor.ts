import { defineChain } from '../../../utils/chain/defineChain.js'

export const skaleRazor = /*#__PURE__*/ defineChain({
  id: 278_611_351,
  name: 'SKALE | Razor Network',
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
