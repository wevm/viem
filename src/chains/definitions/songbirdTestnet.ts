import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const songbirdTestnet = /*#__PURE__*/ Chain.from({
  id: 16,
  name: 'Songbird Testnet Coston',
  nativeCurrency: {
    decimals: 18,
    name: 'Coston Flare',
    symbol: 'CFLR',
  },
  rpcUrls: { http: 'https://coston-api.flare.network/ext/C/rpc' },
  blockExplorers: {
    name: 'Coston Explorer',
    url: 'https://coston-explorer.flare.network',
    apiUrl: 'https://coston-explorer.flare.network/api',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: true,
})
