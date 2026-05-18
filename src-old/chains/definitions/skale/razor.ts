import { defineChain } from '../../../utils/chain/defineChain.js'

export const skaleRazor = /*#__PURE__*/ defineChain({
  id: 278_611_351,
  name: 'SKALE | Razor Network',
  nativeCurrency: { name: 'sFUEL', symbol: 'sFUEL', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet.skalenodes.com/v1/turbulent-unique-scheat'],
      webSocket: ['wss://mainnet.skalenodes.com/v1/ws/turbulent-unique-scheat'],
    },
  },
  blockExplorers: {
    default: {
      name: 'SKALE Explorer',
      url: 'https://turbulent-unique-scheat.explorer.mainnet.skalenodes.com',
    },
  },
  contracts: {},
})
