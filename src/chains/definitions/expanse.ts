import * as Chain from '../../core/Chain.js'

export const expanse = /*#__PURE__*/ Chain.from({
  id: 2,
  name: 'Expanse Network',
  nativeCurrency: {
    decimals: 18,
    name: 'EXP',
    symbol: 'EXP',
  },
  rpcUrls: { http: 'https://node.expanse.tech' },
  blockExplorers: {
    name: 'Expanse Explorer',
    url: 'https://explorer.expanse.tech',
  },
  testnet: false,
})
