import { defineChain } from '../../utils/chain/defineChain.js'

export const superposition = /*#__PURE__*/ defineChain({
  id: 55244,
  name: 'Superposition',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.superposition.so'] },
  },
  blockExplorers: {
    default: {
      name: 'Superposition Explorer',
      url: 'https://explorer.superposition.so',
    },
  },
  testnet: false,
})
