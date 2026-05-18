import { defineChain } from '../../utils/chain/defineChain.js'

export const jasmyChain = /*#__PURE__*/ defineChain({
  id: 680,
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
