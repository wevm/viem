import { defineChain } from '../../utils/chain/defineChain.js'

export const morphTachyon = /*#__PURE__*/ defineChain({
  id: 2184,
  name: 'Morph Tachyon',
  nativeCurrency: {
    name: 'BGB',
    symbol: 'BGB',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://api.popdex.xyz/api/v1/web3/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Morph Tachyon Explorer',
      url: 'https://app.popdex.xyz/explorer',
    },
  },
})
