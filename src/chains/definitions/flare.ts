import { defineChain } from '../../utils/chain/defineChain.js'

export const flare = /*#__PURE__*/ defineChain({
  id: 14,
  name: 'Flare Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'flare',
    symbol: 'FLR',
  },
  rpcUrls: {
    default: { http: ['https://flare-api.flare.network/ext/C/rpc'] },
  },
  blockExplorers: {
    default: {
      name: 'Flare Explorer',
      url: 'https://flare-explorer.flare.network',
      apiUrl: 'https://flare-explorer.flare.network/api',
    },
  },
})
