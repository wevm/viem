import * as Chain from '../../core/Chain.js'

export const eteria = /*#__PURE__*/ Chain.define({
  id: 140n,
  name: 'Eteria',
  nativeCurrency: { name: 'Eteria', symbol: 'ERA', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet.eteria.io/v1'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Eteria Explorer',
      url: 'https://explorer.eteria.io',
      apiUrl: 'https://explorer.eteria.io/api',
    },
  },
})
