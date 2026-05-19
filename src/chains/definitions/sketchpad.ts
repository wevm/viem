import * as Chain from '../../core/Chain.js'

export const sketchpad = /*#__PURE__*/ Chain.define({
  id: 984123n,
  name: 'Forma Sketchpad',
  network: 'sketchpad',
  nativeCurrency: {
    symbol: 'TIA',
    name: 'TIA',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.sketchpad-1.forma.art'],
      webSocket: ['wss://ws.sketchpad-1.forma.art'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Sketchpad Explorer',
      url: 'https://explorer.sketchpad-1.forma.art',
    },
  },
  testnet: true,
})
