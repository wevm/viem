import * as Chain from '../../core/Chain.js'

export const zeroNetwork = /*#__PURE__*/ Chain.define({
  id: 543_210n,
  name: 'Zero Network',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.zerion.io/v1/zero'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Zero Network Explorer',
      url: 'https://explorer.zero.network',
    },
  },
  testnet: false,
})
