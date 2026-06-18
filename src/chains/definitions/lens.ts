import * as Chain from '../../core/Chain.js'

export const lens = /*#__PURE__*/ Chain.from({
  id: 232,
  name: 'Lens',
  nativeCurrency: { name: 'GHO', symbol: 'GHO', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.lens.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Lens Block Explorer',
      url: 'https://explorer.lens.xyz',
      apiUrl: 'https://explorer.lens.xyz/api',
    },
  },
})
