import { defineChain } from '../../utils/chain/defineChain.js'

export const zeroNetwork = /*#__PURE__*/ defineChain({
  id: 543_210,
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
