import * as Chain from '../../core/Chain.js'

export const oasys = /*#__PURE__*/ Chain.define({
  id: 248n,
  name: 'Oasys',
  nativeCurrency: { name: 'Oasys', symbol: 'OAS', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.mainnet.oasys.games'],
    },
  },
  blockExplorers: {
    default: {
      name: 'OasysScan',
      url: 'https://scan.oasys.games',
      apiUrl: 'https://scan.oasys.games/api',
    },
  },
})
