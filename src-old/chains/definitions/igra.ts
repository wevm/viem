import { defineChain } from '../../utils/chain/defineChain.js'

export const igra = /*#__PURE__*/ defineChain({
  id: 38833,
  name: 'Igra Network',
  nativeCurrency: {
    decimals: 18,
    name: 'iKAS',
    symbol: 'iKAS',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.igralabs.com:8545'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Igra Explorer',
      url: 'https://explorer.igralabs.com',
    },
  },
  testnet: false,
})
