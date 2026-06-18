import * as Chain from '../../core/Chain.js'

export const songbirdTestnet = /*#__PURE__*/ Chain.from({
  id: 16,
  name: 'Songbird Testnet Coston',
  nativeCurrency: {
    decimals: 18,
    name: 'Coston Flare',
    symbol: 'CFLR',
  },
  rpcUrls: {
    default: { http: ['https://coston-api.flare.network/ext/C/rpc'] },
  },
  blockExplorers: {
    default: {
      name: 'Coston Explorer',
      url: 'https://coston-explorer.flare.network',
      apiUrl: 'https://coston-explorer.flare.network/api',
    },
  },
  testnet: true,
})
