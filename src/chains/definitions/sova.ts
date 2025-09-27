import { defineChain } from '../../utils/chain/defineChain.js'

export const sova = /*#__PURE__*/ defineChain({
  id: 100_021,
  name: 'Sova',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.sova.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Sova Block Explorer',
      url: 'hhttps://explorer.sova.io',
    },
  },
  testnet: false,
})
