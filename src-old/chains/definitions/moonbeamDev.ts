import { defineChain } from '../../utils/chain/defineChain.js'

export const moonbeamDev = /*#__PURE__*/ defineChain({
  id: 1281,
  name: 'Moonbeam Development Node',
  nativeCurrency: {
    decimals: 18,
    name: 'DEV',
    symbol: 'DEV',
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:9944'],
      webSocket: ['wss://127.0.0.1:9944'],
    },
  },
})
