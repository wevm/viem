import * as Chain from '../../core/Chain.js'

export const reactiveTestnet = /*#__PURE__*/ Chain.from({
  id: 5_318_007,
  name: 'Reactive Lasna Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Lasna React',
    symbol: 'lREACT',
  },
  rpcUrls: { http: 'https://lasna-rpc.rnk.dev' },
  blockExplorers: {
    name: 'Reactscan',
    url: 'https://lasna.reactscan.net',
  },
  testnet: true,
})
