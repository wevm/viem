import * as Chain from '../../core/Chain.js'

export const nahmii = /*#__PURE__*/ Chain.define({
  id: 5551n,
  name: 'Nahmii 2 Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://l2.nahmii.io'] },
  },
  blockExplorers: {
    default: {
      name: 'Nahmii 2 Explorer',
      url: 'https://explorer.n2.nahmii.io',
    },
  },
  testnet: false,
})
