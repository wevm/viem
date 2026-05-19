import * as Chain from '../../core/Chain.js'

export const lens = /*#__PURE__*/ Chain.define({
  id: 232n,
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
