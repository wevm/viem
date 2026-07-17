import * as Chain from '../../core/Chain.js'

export const sketchpad = /*#__PURE__*/ Chain.from({
  id: 984123,
  name: 'Forma Sketchpad',
  nativeCurrency: {
    symbol: 'TIA',
    name: 'TIA',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://rpc.sketchpad-1.forma.art',
    ws: 'wss://ws.sketchpad-1.forma.art',
  },
  blockExplorers: {
    name: 'Sketchpad Explorer',
    url: 'https://explorer.sketchpad-1.forma.art',
  },
  testnet: true,
})
