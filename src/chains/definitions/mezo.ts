import * as Chain from '../../core/Chain.js'

export const mezo = /*#__PURE__*/ Chain.from({
  id: 31_612,
  name: 'Mezo',
  nativeCurrency: {
    decimals: 18,
    name: 'Bitcoin',
    symbol: 'BTC',
  },
  rpcUrls: {
    default: { http: ['https://rpc.mezo.org'] },
  },
  blockExplorers: {
    default: {
      name: 'Mezo Explorer',
      url: 'https://explorer.mezo.org',
    },
  },
})
