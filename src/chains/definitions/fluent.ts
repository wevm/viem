import { defineChain } from '../../utils/chain/defineChain.js'

export const fluent = /*#__PURE__*/ defineChain({
  id: 25_363,
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
