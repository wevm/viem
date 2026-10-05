import * as Chain from '../../core/Chain.js'

export const agungTestnet = /*#__PURE__*/ Chain.from({
  id: 9990,
  name: 'Agung Network',
  nativeCurrency: {
    decimals: 18,
    name: 'Agung',
    symbol: 'AGNG',
  },
  rpcUrls: {
    http: 'https://wss-async.agung.peaq.network',
    ws: 'wss://wss-async.agung.peaq.network',
  },
  blockExplorers: {
    name: 'Subscan',
    url: 'https://agung-testnet.subscan.io',
  },
  testnet: true,
})
