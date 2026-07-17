import * as Chain from '../../core/Chain.js'

export const auroria = /*#__PURE__*/ Chain.from({
  id: 205205,
  name: 'Auroria Testnet',
  nativeCurrency: {
    name: 'Auroria Stratis',
    symbol: 'tSTRAX',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://auroria.rpc.stratisevm.com',
  },
  blockExplorers: {
    name: 'Auroria Testnet Explorer',
    url: 'https://auroria.explorer.stratisevm.com',
  },
  testnet: true,
})
