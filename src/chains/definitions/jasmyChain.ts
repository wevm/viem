import { defineChain } from '../../utils/chain/defineChain.js'

export const jasmyChain = /*#__PURE__*/ defineChain({
  id: 680,
  name: 'Jasmy Chain',
  network: 'jasmyChain',
  nativeCurrency: { name: 'JasmyCoin', symbol: 'JASMY', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.jasmyscan.net'],
      webSocket: ['wss://rpc.jasmyscan.net/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'JasmyScan',
      url: 'https://explorer.jasmyscan.net',
      apiUrl: 'https://explorer.jasmyscan.net/api',
    },
  },
  testnet: false,
})
