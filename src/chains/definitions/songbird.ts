import { defineChain } from '../../utils/chain/defineChain.js'

export const songbird = /*#__PURE__*/ defineChain({
  id: 19,
  name: 'Songbird Canary-Network',
  nativeCurrency: {
    decimals: 18,
    name: 'Songbird',
    symbol: 'SGB',
  },
  rpcUrls: {
    default: { http: ['https://songbird-api.flare.network/ext/C/rpc'] },
  },
  blockExplorers: {
    default: {
      name: 'Songbird Explorer',
      url: 'https://songbird-explorer.flare.network',
      apiUrl: 'https://songbird-explorer.flare.network/api',
    },
  },
})
