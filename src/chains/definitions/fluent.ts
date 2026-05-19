import * as Chain from '../../core/Chain.js'

export const fluent = /*#__PURE__*/ Chain.define({
  id: 25_363n,
  name: 'Fluent',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.fluent.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Fluent Explorer',
      url: 'https://fluentscan.xyz',
    },
  },
  testnet: false,
})
