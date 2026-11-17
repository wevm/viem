import * as Chain from '../../core/Chain.js'

export const eteria = /*#__PURE__*/ Chain.from({
  id: 140,
  name: 'Eteria',
  nativeCurrency: { name: 'Eteria', symbol: 'ERA', decimals: 18 },
  rpcUrls: {
    http: 'https://mainnet.eteria.io/v1',
  },
  blockExplorers: {
    name: 'Eteria Explorer',
    url: 'https://explorer.eteria.io',
    apiUrl: 'https://explorer.eteria.io/api',
  },
})
