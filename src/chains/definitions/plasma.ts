import { defineChain } from '../../utils/chain/defineChain.js'

export const plasma = /*#__PURE__*/ defineChain({
  id: 9745,
  name: 'Plasma',
  nativeCurrency: {
    name: 'Plasma',
    symbol: 'XPL',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.plasma.to'],
    },
  },
  blockExplorers: {
    default: {
      name: 'PlasmaScan',
      url: 'https://plasmascan.to',
    },
  },
})
