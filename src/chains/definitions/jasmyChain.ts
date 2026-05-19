import * as Chain from '../../core/Chain.js'

export const jasmyChain = /*#__PURE__*/ Chain.define({
  id: 680n,
  name: 'Jasmy Chain',
  network: 'jasmyChain',
  nativeCurrency: { name: 'JasmyCoin', symbol: 'JASMY', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.jasmychain.io'],
      webSocket: ['wss://rpc.jasmychain.io'],
    },
  },
  testnet: false,
})
