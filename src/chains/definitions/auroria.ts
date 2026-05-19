import * as Chain from '../../core/Chain.js'

export const auroria = /*#__PURE__*/ Chain.define({
  id: 205205n,
  name: 'Auroria Testnet',
  network: 'auroria',
  nativeCurrency: {
    name: 'Auroria Stratis',
    symbol: 'tSTRAX',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://auroria.rpc.stratisevm.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Auroria Testnet Explorer',
      url: 'https://auroria.explorer.stratisevm.com',
    },
  },
  testnet: true,
})
