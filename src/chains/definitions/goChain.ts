import * as Chain from '../../core/Chain.js'

export const goChain = /*#__PURE__*/ Chain.from({
  id: 60,
  name: 'GoChain',
  nativeCurrency: {
    decimals: 18,
    name: 'GO',
    symbol: 'GO',
  },
  rpcUrls: { http: 'https://rpc.gochain.io' },
  blockExplorers: {
    name: 'GoChain Explorer',
    url: 'https://explorer.gochain.io',
  },
  testnet: false,
})
