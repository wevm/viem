import * as Chain from '../../core/Chain.js'

export const edexa = /*#__PURE__*/ Chain.from({
  id: 5424,
  name: 'edeXa',
  nativeCurrency: { name: 'edeXa', symbol: 'EDX', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.edexa.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'edeXa Explorer',
      url: 'https://explorer.edexa.network',
      apiUrl: 'https://explorer.edexa.network/api/v2',
    },
  },
})
