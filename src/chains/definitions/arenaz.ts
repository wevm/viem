import { defineChain } from '../../utils/chain/defineChain.js'

export const arenaz = /*#__PURE__*/ defineChain({
  id: 7897,
  name: 'Arena-Z',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.arena-z.gg'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Arena-Z Explorer',
      url: 'https://explorer.arena-z.gg',
      apiUrl: 'https://explorer.arena-z.gg',
    },
  },
})
