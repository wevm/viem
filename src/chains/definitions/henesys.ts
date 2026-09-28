import * as Chain from '../../core/Chain.js'

export const henesys = /*#__PURE__*/ Chain.from({
  id: 68414,
  name: 'Henesys',
  nativeCurrency: { name: 'NEXPACE', symbol: 'NXPC', decimals: 18 },
  rpcUrls: {
    http: 'https://henesys-rpc.msu.io',
  },
  blockExplorers: {
    name: 'Avalanche Explorer',
    url: 'https://subnets.avax.network/henesys',
  },
})
