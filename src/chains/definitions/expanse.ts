import * as Chain from '../../core/Chain.js'

export const expanse = /*#__PURE__*/ Chain.define({
  id: 2n,
  name: 'Expanse Network',
  nativeCurrency: {
    decimals: 18,
    name: 'EXP',
    symbol: 'EXP',
  },
  rpcUrls: {
    default: { http: ['https://node.expanse.tech'] },
  },
  blockExplorers: {
    default: {
      name: 'Expanse Explorer',
      url: 'https://explorer.expanse.tech',
    },
  },
  testnet: false,
})
