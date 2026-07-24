import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

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
  contracts: {
    create2: Contracts.create2,
  },
  testnet: true,
})
