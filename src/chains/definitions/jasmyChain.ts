import * as Chain from '../../core/Chain.js'

export const jasmyChain = /*#__PURE__*/ Chain.from({
  id: 680,
  name: 'Jasmy Chain',
  nativeCurrency: { name: 'JasmyCoin', symbol: 'JASMY', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.jasmychain.io'],
      webSocket: ['wss://rpc.jasmychain.io'],
    },
  },
  testnet: false,
})
