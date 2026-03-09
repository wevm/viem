import { defineChain } from '../../utils/chain/defineChain.js'

export const xpla = /*#__PURE__*/ defineChain({
  id: 37,
  name: 'CONX Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'XPLA',
    symbol: 'XPLA',
  },
  rpcUrls: {
    default: {
      http: ['https://dimension-evm-rpc.xpla.dev'],
    },
  },
  blockExplorers: {
    default: {
      name: 'CONX Explorer',
      url: 'https://explorer.conx.xyz',
    },
  },
  testnet: false,
})
